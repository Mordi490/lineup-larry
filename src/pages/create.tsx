import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ui/button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaDiscord } from "react-icons/fa";
import * as z from "zod";
import { agentZodYes, mapZodYes } from "../../utils/enums";
import Layout from "../components/layout";
import { api } from "../utils/api";
import BasicDropzone from "../components/Dropzone";

export const MAX_FILE_SIZE = 1024 * 1024 * 80; // 80MB, for now

type imageFile = Record<string, any>;

export const createLineupForm = z.object({
  title: z.string(),
  agent: z.enum(agentZodYes),
  map: z.enum(mapZodYes),
  text: z.string(),
  isSetup: z.boolean(),
  image: z.preprocess(
    (val) => Object.values(val as Array<imageFile>),
    z.array(z.any())
  ),
});

// helper func for validation
export const getFileSize = (props: File[]): number => {
  let res: number = 0;
  Object.values(props).forEach((val) => (res += val.size));
  return res;
};

const Create = () => {
  // Consider setting it to null initially, and refuse to send it until user selects a image to preview
  const [previewImg, setPreviewImg] = useState<number>(0);
  const [presignedUrls, setPresignedUrls] = useState<string[]>([]);

  const { data: session } = useSession();
  const router = useRouter();

  const agentList = agentZodYes;
  const mapList = mapZodYes;

  type formSchemaType = z.infer<typeof createLineupForm>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<formSchemaType>({
    resolver: zodResolver(createLineupForm),
    defaultValues: {
      image: [],
    },
  });

  const { mutate } = api.lineup.create.useMutation({
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

  const { mutateAsync: createPresignedUrl } =
    api.lineup.createPresignedUrl.useMutation();

  const onSubmit: SubmitHandler<formSchemaType> = async (formInput) => {
    toast.loading("Uploading lineup");

    if (getFileSize(formInput.image) > MAX_FILE_SIZE * 5) {
      // TODO: better feedback
      alert("Your files are too large!");
    }

    // create a presignedURL for each of the images
    let createdUrls = "";
    const len = formInput.image.length;
    let curr = 1;
    // TODO: perform this async instead of sequentially, remember to keep the order intact
    for (let file of formInput.image) {
      const { url, fields } = await createPresignedUrl({
        fileType: file.type as string,
      });

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
        createdUrls += fields.Key;
      } else {
        createdUrls += fields.Key + ",";
      }
      curr++;
    }

    const createLineupObject = {
      title: formInput.title,
      creator: session?.user?.name as string,
      userId: session?.user?.id as string,
      agent: formInput.agent,
      map: formInput.map,
      text: formInput.text,
      isSetup: formInput.isSetup,
      previewImg: previewImg,
      image: createdUrls, // for now set it to be the 2nd element
    };

    try {
      mutate(createLineupObject);
    } catch (e) {
      console.error(e);
    }
  };

  if (!session)
    return (
      <Layout
        title="Submit Lineup"
        name="Submit Lineup"
        description="Login & submit a lineup"
      >
        <h1 className="my-2 text-center text-3xl text-red-300">
          You have to be logged in to create a lineup
        </h1>
        <div className="flex justify-center">
          <Button
            intent={"secondary"}
            aria-label="Login button"
            onClick={() => signIn("discord")}
          >
            Sign in with Discord{" "}
            <span className="ml-2">
              <FaDiscord size={24} />
            </span>
          </Button>
        </div>
      </Layout>
    );

  return (
    <Layout title="Submit a Lineup" text="Submit a Lineup">
      <h1 className="text-bold my-2 text-center text-2xl font-bold">
        Please fill out the form below
      </h1>

      <div className="mx-4">
        <form
          className="flex flex-col items-baseline justify-center space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col space-y-1">
            <label form="title" className="text-sm font-medium">
              Title
            </label>
            <input
              placeholder="Lineup Title"
              className="text-white"
              {...register("title")}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium">Agent</label>
            <select className="text-white" {...register("agent")}>
              <option placeholder="select Map" disabled={true}>
                Select agent
              </option>
              {agentList.map((agent) => (
                <option value={agent} key={agent} disabled={isSubmitting}>
                  {agent}
                </option>
              ))}
            </select>
            {errors.agent && (
              <p className="text-sm text-red-600">{errors.agent.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium">Map</label>
            <select className="text-white" {...register("map")}>
              <option placeholder="select Map" disabled={true}>
                Select Map
              </option>
              {mapList.map((map) => (
                <option key={map} value={map} disabled={isSubmitting}>
                  {map}
                </option>
              ))}
            </select>
            {errors.map && (
              <p className="text-sm text-red-600">{errors.map.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium">Text</label>
            <textarea
              placeholder="a few words about the lineup"
              className="text-white"
              rows={3}
              cols={40}
              {...register("text")}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-1">
            <input
              className="items-centers inline-flex rounded border-gray-600 bg-gray-700 text-blue-600 ring-offset-gray-800 focus:ring-2 focus:ring-blue-600"
              {...register("isSetup")}
              type="checkbox"
              disabled={isSubmitting}
            />
            <label className="inline-flex items-center font-medium">
              Is a setup
            </label>
          </div>

          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <BasicDropzone
                setPresignedUrl={setPresignedUrls}
                presignedUrl={presignedUrls}
                previewImg={previewImg}
                setPreviewImg={setPreviewImg}
                files={field.value}
                onChangeFile={field.onChange}
              />
            )}
          />

          <Button
            intent="primary"
            fullWidth
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Submit"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Create;
