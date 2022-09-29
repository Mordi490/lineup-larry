import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { SubmitHandler, useForm } from "react-hook-form";
import { Agent, Map, TypedKeys } from "../../../utils/enums";
import { lineupFormValues } from "../../server/router/schemas/lineup.schema";
import { trpc } from "../../utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PresignedPost } from "aws-sdk/clients/s3";
import Image from "next/image";
import Loading from "../../../components/loading";
import Layout from "../../../components/layout";

const EditLineup = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const id = router.query.id as string;

  const agentList = TypedKeys(Agent);
  const mapList = TypedKeys(Map);

  type formSchemaType = z.infer<typeof lineupFormValues>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<formSchemaType>({
    resolver: zodResolver(lineupFormValues),
  });

  // fetch the specific lineup data
  const {
    data: lineup,
    isLoading,
    isError,
    error,
  } = trpc.useQuery(["lineup.by-id", { id }]);

  // gen new presigned url for the updatd lineup
  const { mutateAsync: preSignedUrl } = trpc.useMutation([
    "privateLineup.create-presigned-url",
  ]);

  // delete prev s3 obj
  const currLineupId = lineup?.id as string;
  const { mutate: deletedS3Obj } = trpc.useMutation([
    "privateLineup.delete-s3-object",
  ]);

  // persist the changes to db
  const { mutate: updatedLineup } = trpc.useMutation([
    "privateLineup.update-lineup",
  ]);

  if (isLoading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Head>
          <title>Create a lineup</title>
        </Head>

        <h1>You have to be logged in to create a lineup</h1>
        <h1>Please log in</h1>
        <button onClick={() => signIn("discord")}>Sign in with Discord</button>
      </>
    );
  }

  if (isError) {
    return (
      <Layout>
        <h1>Sorry Something went wrong</h1>
        <p>{JSON.stringify(error, null, 4)}</p>
      </Layout>
    );
  }

  const onSubmit: SubmitHandler<formSchemaType> = async (formInput) => {
    // NB! S3 objects cannot be updated, so steps should be: create new -> Delete prev -> update db

    // TODO: detect what changed and update only new data

    // create a new S3 object
    // HAS TO BE DONE FIRST IN ORDER TO OBTAIN THE IMAGE URL
    const fileType: string = formInput.image?.[0].type;
    const file: File = formInput.image[0];

    const { url, fields }: { url: string; fields: PresignedPost.Fields } =
      await preSignedUrl();

    interface S3ImageData {
      "Content-Type": string;
      file: File;
      Policy: string;
      "X-Amz-Signature": string;
    }
    const s3Data: S3ImageData = {
      ...fields,
      "Content-Type": fileType,
      file,
    };

    const formData = new FormData();
    for (const name in s3Data) {
      formData.append(name, s3Data[name as keyof S3ImageData]);
    }

    // send updated image to s3
    // TODO: error handling, make sure this only conts if successful
    const s3Res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    // delete prev obj
    const currS3Key = lineup?.id as string;
    const delRes = deletedS3Obj({ id: currS3Key });

    // update db
    const updatedLineupObject = {
      title: formInput.title,
      // TODO: determine if we care about creator/userID anymore
      creator: session.user?.name as string,
      userId: session.user?.id as string,
      agent: formInput.agent,
      map: formInput.map,
      text: formInput.text,
      image: fields.Key,
    };

    const updateRes = updatedLineup({
      id: currS3Key,
      updatedData: updatedLineupObject,
    });
  };

  return (
    <Layout title={`${lineup?.title}`}>
      <h1 className="text-center text-2xl text-bold mt-2">Editing Lineup</h1>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-6 sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label>Title</label>
            <div className="mt-1">
              <input
                className="text-white"
                placeholder={`${lineup?.title}`}
                defaultValue={`${lineup?.title}`}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label>Agent</label>
              <div className="mt-1">
                <select {...register("agent")} className="text-white">
                  <option value="Agent" placeholder={`${lineup?.agent}`}>
                    {lineup?.agent}
                  </option>
                  {agentList.map((agent) => (
                    <option value={agent} key={agent} disabled={isSubmitting}>
                      {agent}
                    </option>
                  ))}
                </select>
                {errors.agent?.message && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.agent.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label>Map</label>
              <div className="mt-1">
                <select {...register("map")} className="text-white">
                  <option placeholder={`${lineup?.map}`}>{lineup?.map}</option>
                  {mapList.map((map) => (
                    <option key={map} value={map} disabled={isSubmitting}>
                      {map}
                    </option>
                  ))}
                </select>
                {errors.map?.message && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.map.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label>Text</label>
              <div className="mt-1">
                <textarea
                  cols={30}
                  rows={10}
                  className="text-white"
                  {...register("text")}
                  placeholder="Supplement text"
                  defaultValue={`${lineup?.text}`}
                />
                {errors.text?.message && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.text.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2>prev image(s)</h2>
              <Image
                src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${lineup?.image}`}
                alt="Valorant screenshot"
                width={1080}
                height={600}
              />
            </div>
            <input type="file" {...register("image")} disabled={isSubmitting} />

            <button
              type="submit"
              className="w-full px-8 py-4 flex items-center justify-center uppercase text-white font-semibold bg-blue-600 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditLineup;
