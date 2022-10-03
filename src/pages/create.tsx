import { signIn, useSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Agent, Map, TypedKeys } from "../../utils/enums";
import { lineupFormValues } from "../server/router/schemas/lineup.schema";
import { trpc } from "../utils/trpc";
import Layout from "../../components/layout";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

const Create = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const agentList = TypedKeys(Agent);
  const mapList = TypedKeys(Map);

  type formSchemaType = z.infer<typeof lineupFormValues>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<formSchemaType>({
    resolver: zodResolver(lineupFormValues),
  });

  const { mutateAsync: preSignedUrl } = trpc.useMutation([
    "privateLineup.create-presigned-url",
  ]);

  const { mutate } = trpc.useMutation(["privateLineup.create"], {
    onSuccess: (data) => {
      toast.remove();
      toast.success("Lineup created");
      router.push(`lineup/${data.id}`);
    },
    onError: (err) => {
      toast.remove();
      toast.error("Something went wrong");
      console.log(err);
    },
  });

  const onSubmit: SubmitHandler<formSchemaType> = async (formInput) => {
    toast.loading("Uploading lineup");
    const fileType: string = formInput.image?.[0].type;
    const file: File = formInput.image?.[0];
    const { url, fields } = await preSignedUrl();

    interface S3ImageData {
      "Content-Type": string;
      file: File;
      Policy: string;
      "X-Amz-Signature": string;
    }

    // marshall the data we want to send to s3
    const s3Data: S3ImageData = {
      ...fields,
      "Content-Type": fileType,
      file,
    };

    const formData = new FormData();
    for (const name in s3Data) {
      formData.append(name, s3Data[name as keyof S3ImageData]);
    }

    // send image to s3
    // TODO: error handling, make sure this only conts if successful
    const s3Res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const createLineupObject = {
      title: formInput.title,
      creator: session?.user?.name as string,
      userId: session?.user?.id as string,
      agent: formInput.agent,
      map: formInput.map,
      text: formInput.text,
      image: fields.Key,
    };

    try {
      mutate(createLineupObject);
    } catch (e) {
      console.log(e);
    }
    // TODO: give user feedback on success and redirect?
  };

  if (!session)
    return (
      <Layout title="Create a lineup">
        <h1>You have to be logged in to create a lineup</h1>
        <h1>Please log in</h1>
        <button onClick={() => signIn("discord")}>Sign in with Discord</button>
      </Layout>
    );

  return (
    <Layout title="Create a lineup">
      <h1 className="text-center text-2xl text-bold mt-2">
        Please fill out the form below
      </h1>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-6 sm:px-10">
          <form className="mb-0 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <label form="title" className="block text-sm font-medium">
              Title
            </label>
            <div className="mt-1">
              <input
                placeholder="Lineup Title"
                className="text-white"
                {...register("title")}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Agent</label>
              <div className="mt-1">
                <select className="text-white" {...register("agent")}>
                  <option placeholder="select Map" disabled={true}>
                    Select agent
                  </option>
                  {agentList.map((agent) => (
                    <option value={agent} key={agent} disabled={isSubmitting}>
                      {agent.toUpperCase()}
                    </option>
                  ))}
                </select>
                {errors.agent && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.agent.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Map</label>
              <div className="mt-1">
                <select className="text-white" {...register("map")}>
                  <option placeholder="select Map" disabled={true}>
                    Select Map
                  </option>
                  {mapList.map((map) => (
                    <option key={map} value={map} disabled={isSubmitting}>
                      {map.toUpperCase()}
                    </option>
                  ))}
                </select>
                {errors.map && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.map.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Text</label>
              <div className="mt-1">
                <textarea
                  placeholder="a few words about the lineup"
                  className="text-white"
                  {...register("text")}
                  disabled={isSubmitting}
                />
                {errors.text && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.text.message}
                  </p>
                )}
                {/* TODO: error validation for files */}
                <input
                  type="file"
                  {...register("image")}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 flex items-center justify-center uppercase text-white font-semibold bg-blue-600 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Submit"}
            </button>

            <div className="hidden">
              {/* TODO: confirm that these can be set via trpc endpoint*/}
              {/* 
          <input {...register("creator")} />
          <input {...register("userId")} />
                  */}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
