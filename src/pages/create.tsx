import { signIn, useSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Agent from "../../utils/Agent";
import Map from "../../utils/Map";
import { lineupFormValues } from "../server/router/schemas/lineup.schema";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { PresignedPost } from "aws-sdk/clients/s3";

const Create = () => {
  const { data: session } = useSession();

  const router = useRouter();

  type formSchemaType = z.infer<typeof lineupFormValues>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    resolver: zodResolver(lineupFormValues),
  });

  const { mutateAsync: preSignedUrl } = trpc.useMutation([
    "privateLineup.create-presigned-url",
  ]);

  const { mutate: lineupData } = trpc.useMutation(["privateLineup.create"]);

  const onSubmit: SubmitHandler<formSchemaType> = async (formInput) => {
    const fileType: string = formInput.image?.[0].type;
    const file: File = formInput.image?.[0];
    const { url, fields }: { url: string; fields: PresignedPost.Fields } =
      await preSignedUrl();

    // create the data we want to send to the
    const s3Data = {
      ...fields,
      "Content-Type": fileType,
      file,
    };

    const formData = new FormData();
    for (const name in s3Data) {
      formData.append(name, s3Data[name]);
    }

    // send image to s3
    const s3Res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const createLineupObject = {
      title: formInput.text,
      creator: session?.user?.name as string,
      userId: session?.user?.id as string,
      agent: formInput.agent,
      map: formInput.map,
      text: formInput.text,
      // image val SHOULD have been overwritten to the s3Url by
      image: fields.Key,
    };

    try {
      lineupData(createLineupObject);
    } catch (e) {
      console.log(e);
    }
    // TODO: give user feedback on success and redirect?
  };

  if (!session)
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

  return (
    <>
      <Head>
        <title>Create a lineup</title>
      </Head>

      <h1 className="text-center text-2xl text-bold mt-2">
        Please fill out the form below
      </h1>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-6 shadow rounded-lg sm:px-10">
          <form className="mb-0 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <label form="title" className="block text-sm font-medium">
              Title
            </label>
            <div className="mt-1">
              <input
                placeholder="Lineup Title"
                className="text-black"
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
                <select className="text-black" {...register("agent")}>
                  <option placeholder="select Agent" disabled={true}>
                    Select Agent
                  </option>
                  {Agent.map((agent) => (
                    <option key={agent} value={agent} disabled={isSubmitting}>
                      {agent}
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
                <select className="text-black" {...register("map")}>
                  <option placeholder="select Map" disabled={true}>
                    Select Map
                  </option>
                  {Map.map((map) => (
                    <option key={map} value={map} disabled={isSubmitting}>
                      {map}
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
                  className="text-black"
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

        <pre>{JSON.stringify(watch(), null, 4)}</pre>
      </div>
    </>
  );
};

export default Create;
