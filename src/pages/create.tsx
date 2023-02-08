import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaDiscord } from "react-icons/fa";
import * as z from "zod";
import Layout from "../components/layout";
import { agentZodYes, mapZodYes } from "../../utils/enums";
import { api } from "../utils/api";
import { Button } from "@ui/button";
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import Image from "next/image";

// moving this one here since using the File API fucks over the import
// describes the form object for creating & editing lineupsF

type imageFile = Record<string, any>;

export const MAX_FILE_SIZE = 1024 * 1024 * 80; // 80MB, for now

export const createLineupForm = z.object({
  title: z.string().min(1, { message: "Required" }),
  agent: z.enum(agentZodYes),
  map: z.enum(mapZodYes),
  text: z.string(),
  isSetup: z.boolean(),
  previewImg: z.number().nonnegative().default(2),
  image: z.preprocess(
    (val) => Object.values(val as Array<imageFile>),
    z.array(z.any())
  ),
});

// helper func for validation
export const getFileSize = (props: any[]): number => {
  let res: number = 0;
  Object.values(props).forEach((val) => (res += val.size));
  return res;
};

const Create = () => {
  //const [files, setFiles] = useState([]);
  //const [filePreview, setFilePreview] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();

  // These are noe longer what we want
  const agentList = agentZodYes;
  const mapList = mapZodYes;

  type formSchemaType = z.infer<typeof createLineupForm>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<formSchemaType>({
    resolver: zodResolver(createLineupForm),
  });

  const { mutateAsync: preSignedUrl } =
    api.lineup.createPresignedUrl.useMutation();

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

  const handleFileChange = (e) => {
    console.log(e.target.files);
    setFiles([...e.target.files]);
  };

  const OrderCheckXddd = (e) => {
    console.log(e.target.values);
  };

  /*
  // useEffect to render the imgPreview
  useEffect(() => {
    if (files.length < 1) return;
    const newImageUrls = [];
    files.map((file) => newImageUrls.push(URL.createObjectURL(file)));
    setFilePreview(newImageUrls);
  }, [files]);
  */

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
      const { url, fields } = await preSignedUrl({
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
        presigendUrls += fields.Key;
      } else {
        presigendUrls += fields.Key + ",";
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

          <div className="border-1 flex flex-col border border-red-500">
            <input
              type="file"
              multiple
              {...register("image")}
              onChange={handleFileChange}
              disabled={isSubmitting}
              accept="image/*, video/*"
            />
            {errors.image && (
              <p className=" text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>
          <MuhDropzoneThing />

          {/* TODO: prompt user with which img to use for preview */}

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

const MuhDropzoneThing = () => {
  const [previewImg, setPreviewImg] = useState(0);
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);

  const onImgClick = (e: number) => {
    setPreviewImg(e);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file, index) => (
    <div
      className="relative mx-4 my-2 inline-flex 
     h-32 w-32 rounded"
      key={file.name}
    >
      {index == previewImg ? (
        <div className="border-2 border-red-500">
          <div className="flex min-w-0 overflow-hidden">
            <Image
              src={file.preview}
              key={index}
              alt="This image will be used for preview"
              width={300}
              height={300}
              onClick={() => onImgClick(index)}
              // Revoke data uri after image is loaded
              //onLoad={() => { URL.revokeObjectURL(file.preview) }} // may or may not be important
            />
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 overflow-hidden">
          <Image
            src={file.preview}
            alt="preview of your files"
            width={300}
            height={300}
            onClick={() => onImgClick(index)}
            // Revoke data uri after image is loaded
            //onLoad={() => { URL.revokeObjectURL(file.preview) }} // may or may not be important
          />
        </div>
      )}
    </div>
  ));

  // TODO: make this actually updates when files change
  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <section className="rounded-lg border-2 border-dashed border-black bg-gray-400 px-8 py-4">
      <div
        {...getRootProps({ className: "dropzone" })}
        className="p-1 hover:cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside className="mt-4 flex flex-wrap">{thumbs}</aside>
      {thumbs.length ? (
        <p>Select which image you want to use as preview</p>
      ) : null}
    </section>
  );
};

export default Create;
