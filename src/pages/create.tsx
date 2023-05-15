import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ui/button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaDiscord } from "react-icons/fa";
import * as z from "zod";
import Layout from "../components/layout";
import { api } from "../utils/api";
import BasicDropzone from "../components/Dropzone";
import { agentList, mapList } from "../../utils/enums";

export const MAX_TOTAL_SIZE = 1024 * 1024 * 80; // 80MB, for now

type imageFile = Record<string, any>;

export const createLineupForm = z.object({
  title: z.string(),
  agent: z.enum(agentList),
  map: z.enum(mapList),
  text: z.string(),
  isSetup: z.boolean(),
  image: z.preprocess(
    (val) => Object.values(val as Array<imageFile>),
    z.array(z.any())
  ),
});

export const splitFileIntoParts = (file: File) => {
  const chunkSize = 1024 * 1024 * 6;
  const numberOfChunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  const fileParts: File[] = [];

  while (currentChunk < numberOfChunks) {
    const chunkStart = currentChunk * chunkSize;
    const chunkEnd = Math.min(file.size, chunkStart + chunkSize);
    const filePartBlob = file.slice(chunkStart, chunkEnd);
    const filePartName = `CHUNK${currentChunk}-${file.name}`;
    const filePart = new File([filePartBlob], filePartName);
    fileParts.push(filePart);
    currentChunk++;
  }
  const partsAsObject: { [partNumber: number]: File } = {};
  for (let i = 1; i <= fileParts.length; i++) {
    partsAsObject[i] = fileParts[i - 1] as File;
  }
  return partsAsObject;
};

// helper func for validation
export const getFileSize = (props: File[]): number => {
  let res: number = 0;
  Object.values(props).forEach((val) => (res += val.size));
  return res;
};

const Create = () => {
  const [previewImg, setPreviewImg] = useState<number>(0);

  // states for multipart file uploads
  const [fileParts, setFileParts] = useState<{ [partNumber: number]: File }>(
    {}
  );
  const [multipartPartPresignedUrl, setMultipartPartPresignedUrl] = useState<
    { url: string; partNumber: number }[]
  >([]);
  const [uploadId, setUploadId] = useState<string>("");

  const { data: session } = useSession();
  const router = useRouter();

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

  // NB! a failed S3 upload still counts as success, look into it
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

  const { mutateAsync: createMultipartUpload } =
    api.lineup.createMultipartUpload.useMutation();

  const onSubmit: SubmitHandler<formSchemaType> = async (formInput) => {
    toast.loading("Uploading lineup");

    if (getFileSize(formInput.image) > MAX_TOTAL_SIZE) {
      // TODO: better feedback, toasts, disable submit or smth
      alert("Your files are too large!\nPlease select fewer or smaller files!");
      toast.remove();
      toast.error("Total file size too large!");
      return;
    }

    // create a presignedURL for each of the images
    let createdUrls = "";
    const len = formInput.image.length;
    let curr = 1;
    // TODO: perform this async instead of sequentially, remember to keep the order intact
    for (const file of formInput.image) {
      const fileKey = file.type.includes("video")
        ? "video-" + crypto.randomUUID()
        : crypto.randomUUID();

      // determine if multipart upload is needed or not
      // use multipart file uploads when files are larger than 20 mb
      if (file.size > 1024 * 1024 * 20) {
        // remember S3 has a lower limit of 5 mb chunks
        const parts = splitFileIntoParts(file);
        setFileParts(parts);

        createMultipartUpload({
          key: fileKey,
          totalFileParts: Object.keys(parts).length,
        })
          .then((response) => {
            if (response) {
              const urls = response.urls.map((data) => ({
                url: data.url,
                partNumber: data.partNumber,
              }));
              setMultipartPartPresignedUrl(urls);
              setUploadId(response.uploadId);
            }
          })
          .catch((error) => console.log(error));

        // cont with complete multipart upload if needed
      }

      const { url, fields } = await createPresignedUrl({
        fileType: file.type,
        key: fileKey,
      });

      const formData = new FormData();

      const s3Data: Record<string, string | File | undefined> = {
        ...fields,
        "Content-Type": file.type,
        file,
      };

      for (const name in s3Data) {
        const value = s3Data[name];
        if (value) {
          formData.append(name, value);
        }
      }

      await fetch(url, {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          //console.log("successful upload");
          //console.log(res);
        })
        .catch((err) => {
          toast.error("Failed to upload file(s)");
          //console.log("unsuccessfully upload");
          //console.log(err);
        });

      if (curr == len) {
        createdUrls += fileKey;
        //console.log("createdUrls is:", createdUrls);
      } else {
        createdUrls += fileKey + ",";
        //console.log("createdUrls is:", createdUrls);
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
