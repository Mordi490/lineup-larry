import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { GiConsoleController } from "react-icons/gi";
import * as z from "zod";
import Layout from "../../components/layout";
import { Agent, Map, TypedKeys } from "../../utils/enums";
import { trpc } from "../utils/trpc";

// moving this one here since using the File API fucks over the import
// describes the form object for creating & editing lineups

type imageFile = Record<string, any>;

export const MAX_FILE_SIZE = 1024 * 1024 * 4; // 4MB

export const lineupFormValues = z.object({
  title: z.string().min(1, { message: "Required" }),
  agent: z.string().min(1, { message: "An Agent has to be selected" }),
  map: z.string().min(1, { message: "A Map has to be selected" }),
  text: z.string().min(1, { message: "Required" }),
  isSetup: z.boolean(),
  previewImg: z.number().nonnegative().default(2),
  image: z.preprocess(
    (val) => Object.values(val as Array<imageFile>),
    z.array(z.any())
  ),
});

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

  // helper func for validation
  const getFileSize = (props: any[]): number => {
    let res: number = 0;
    Object.values(props).forEach((val) => (res += val.size));
    return res;
  };

  const onSubmit: SubmitHandler<formSchemaType> = async (formInput) => {
    toast.loading("Uploading lineup");

    // how much validation is possible on the frontend??? A LOT IT SEEMS

    if (getFileSize(formInput.image) > MAX_FILE_SIZE * 5) {
      // TODO: better feedback
      alert("Your files are too large!");
    }

    // create a presignedURL for each of the images
    let presigendUrls = "";
    const len = formInput.image.length;
    let curr = 1;
    for (let file of formInput.image) {
      const { url, fields } = await preSignedUrl();

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

      console.log(`File number ${curr} is ${file.name}`);
      console.log("Added a url: " + fields.Key);
      if (curr == len) {
        presigendUrls += fields.Key;
      } else {
        presigendUrls += fields.Key + ",";
      }
      curr++;
    }
    console.log("raw list:");
    console.log(presigendUrls);
    const splitImgData = presigendUrls.split(",");
    console.log("array rep of prev list:");
    console.log(splitImgData);
    console.log("2n img element is : " + splitImgData[1]?.replace(",", ""));
    const createLineupObject = {
      title: formInput.title,
      creator: session?.user?.name as string,
      userId: session?.user?.id as string,
      agent: formInput.agent,
      map: formInput.map,
      text: formInput.text,
      isSetup: formInput.isSetup,
      previewImg: 2, // defaults to 2nd element
      image: presigendUrls, // for now set it to be the 2nd element
    };

    try {
      mutate(createLineupObject);
    } catch (e) {
      console.log(e);
    }
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
      <h1 className="text-bold mt-2 text-center text-2xl">
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
                <p className="mt-1 text-sm text-red-600">
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
                  <p className="mt-1 text-sm text-red-600">
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
                  <p className="mt-1 text-sm text-red-600">
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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.text.message}
                  </p>
                )}

                <div className="my-4 flex gap-2">
                  <input
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 ring-offset-gray-800 focus:ring-2 focus:ring-blue-600"
                    {...register("isSetup")}
                    type="checkbox"
                    disabled={isSubmitting}
                  />
                  <label className="block text-sm font-medium">
                    Is a setup
                  </label>
                </div>

                <input
                  type="file"
                  multiple
                  {...register("image")}
                  disabled={isSubmitting}
                  accept="image/*, video/*"
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.image.message}
                  </p>
                )}
              </div>
            </div>

            {/* TODO: prompt user with which img to use for preview */}

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-8 py-4 font-semibold uppercase text-white disabled:bg-gray-100 disabled:text-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Submit"}
            </button>
          </form>
        </div>
      </div>

      <pre>{JSON.stringify(watch(), null, 4)}</pre>
    </Layout>
  );
};

export default Create;
