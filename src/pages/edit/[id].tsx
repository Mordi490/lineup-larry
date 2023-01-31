import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import Layout from "../../components/layout";
import Loading from "../../components/loading";
import { api } from "../../utils/api";
import { createLineupForm, getFileSize, MAX_FILE_SIZE } from "../create";
import { Button } from "@ui/button";
import { agentZodYes, mapZodYes } from "../../../utils/enums";

const EditLineup = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const id = router.query.id as string;

  type formSchemaType = z.infer<typeof createLineupForm>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<formSchemaType>({
    resolver: zodResolver(createLineupForm),
  });

  // fetch the specific lineup data
  const { data: lineup, isLoading, isError } = api.lineup.byId.useQuery({ id });

  // gen new presigned url for the updated lineup
  const { mutateAsync: preSignedUrl } =
    api.lineup.createPresignedUrl.useMutation();

  // delete prev s3 obj
  const { mutate: deletedS3Obj } = api.lineup.deleteS3Object.useMutation();

  // persist the changes to db
  const { mutate: updatedLineup } = api.lineup.updateLineup.useMutation({
    onSuccess: (data) => {
      toast.remove();
      toast.success("Lineup edited");
      router.replace(`edit/${id}`, `/lineup/${data.id}`);
    },
    onError: (err) => {
      toast.remove();
      toast.error("Something went wrong");
      console.log(err);
    },
  });

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
        <Button
          intent={"secondary"}
          href="/api/auth/signin"
          aria-label="Login"
          onClick={() => signIn("discord")}
        >
          Sign in with Discord
        </Button>
      </>
    );
  }

  if (isError || !lineup) {
    return (
      <Layout>
        <h1>Sorry Something went wrong</h1>
      </Layout>
    );
  }

  const onSubmit: SubmitHandler<formSchemaType> = async (formInput) => {
    toast.loading("Updating lineup");
    // NB! S3 objects cannot be updated, so steps should be: create new -> Delete prev -> update db

    // QoL for future?: detect what changed and update only new data

    // create a new S3 object
    // HAS TO BE DONE FIRST IN ORDER TO OBTAIN THE IMAGE URL
    if (getFileSize(formInput.image) > MAX_FILE_SIZE * 5) {
      alert("Your files are too large!");
    }

    // create a presignedURL for each of the images
    let presigendUrls = "";
    const len = formInput.image.length;
    let curr = 1;
    for (let file of formInput.image) {
      const { url, fields } = await preSignedUrl({ fileType: file.type });

      interface S3ImageData {
        "Content-Type": string;
        file: File;
        Policy: string;
        "X-Amz-Signature": string;
      }

      const s3Data: S3ImageData = {
        ...fields,
        "Content-Type": file.type,
        file,
      };

      const formData = new FormData();
      for (const name in s3Data) {
        formData.append(name, s3Data[name as keyof S3ImageData]);
      }

      await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (curr == len) {
        presigendUrls += fields.Key;
      } else {
        presigendUrls += fields.Key + ",";
      }
      curr++;
    }
    // delete prev obj(s) they are stored in lineup as: "presignedA, presignedB, presignedC"
    const oldImgs = lineup.image.split(",");
    for (let i = 0; i > oldImgs.length; i++) {
      deletedS3Obj({ id: oldImgs[i] as string });
    }
    // old del process
    const currS3Key = lineup?.id as string;

    // update db
    const updatedLineupObject = {
      title: formInput.title,
      // TODO: determine if we care about creator/userID anymore
      creator: session.user?.name as string,
      userId: session.user?.id as string,
      agent: formInput.agent,
      map: formInput.map,
      text: formInput.text,
      isSetup: formInput.isSetup,
      previewImg: 0, // Hardcoded, for now
      image: presigendUrls,
    };

    const updateRes = updatedLineup({
      id: currS3Key,
      updatedData: updatedLineupObject,
    });
  };

  return (
    <Layout title={`${lineup?.title}`}>
      <h1 className="text-bold mt-2 text-center text-2xl">Editing Lineup</h1>

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
                <p className="mt-1 text-sm text-red-600">
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
                  {agentZodYes.map((agent) => (
                    <option value={agent} key={agent} disabled={isSubmitting}>
                      {agent}
                    </option>
                  ))}
                </select>
                {errors.agent?.message && (
                  <p className="mt-1 text-sm text-red-600">
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
                  {mapZodYes.map((map) => (
                    <option key={map} value={map} disabled={isSubmitting}>
                      {map}
                    </option>
                  ))}
                </select>
                {errors.map?.message && (
                  <p className="mt-1 text-sm text-red-600">
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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.text.message}
                  </p>
                )}
              </div>
            </div>

            <div className="my-4 flex h-5 gap-2">
              <input
                className="texts-blue-600 h-4 w-4 rounded border-gray-600 bg-gray-700 ring-offset-gray-800 focus:ring-2 focus:ring-blue-600"
                {...register("isSetup")}
                type="checkbox"
                disabled={isSubmitting}
              />
              <label className="block text-sm font-medium">Is a setup</label>
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
            <input
              type="file"
              {...register("image")}
              disabled={isSubmitting}
              multiple
              accept="image/*, video/*"
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">
                {errors.image.message}
              </p>
            )}

            <Button
              intent={"primary"}
              type="submit"
              fullWidth
              aria-label="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Submit"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditLineup;
