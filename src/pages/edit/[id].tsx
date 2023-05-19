import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import Layout from "../../components/layout";
import Loading from "../../components/loading";
import { api } from "../../utils/api";
import {
  createLineupForm,
  getFileSize,
  MAX_TOTAL_SIZE,
  splitFileIntoParts,
} from "../create";
import { Button } from "@ui/button";
import { useState } from "react";
import BasicDropzone from "../../components/Dropzone";
import { agentList, mapList } from "../../../utils/enums";

const EditLineup = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const id = router.query.id as string;

  const [previewImg, setPreviewImg] = useState<number>(0);

  // states for multipart file uploads
  const [fileParts, setFileParts] = useState<{ [partNumber: number]: File }>(
    {}
  );
  const [multipartPartPresignedUrl, setMultipartPartPresignedUrl] = useState<
    { url: string; partNumber: number }[]
  >([]);
  const [uploadId, setUploadId] = useState<string>("");

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

  // fetch the specific lineup data
  const { data: lineup, isLoading, isError } = api.lineup.byId.useQuery({ id });

  const { mutateAsync: createPresignedUrl } =
    api.lineup.createPresignedUrl.useMutation();

  const { mutateAsync: createMultipartUpload } =
    api.lineup.createMultipartUpload.useMutation();

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
    // QoL for future?: detect what changed and update only new data

    // create a new S3 object
    // HAS TO BE DONE FIRST IN ORDER TO OBTAIN THE IMAGE URL
    if (getFileSize(formInput.image) > MAX_TOTAL_SIZE) {
      // TODO: better feedback, toasts, disable submit or smth
      alert("Your files are too large!\nPlease select fewer or smaller files!");
      toast.remove();
      toast.error("Total file size too large!");
      return;
    }

    /**
     * Current approach to S3 stored data, but dumb:
     * we preemptively delete all the imageUrls for the lineup and replace them
     */

    // TODO: 
    // delete prev the s3 data, curr impl takes in the lineup, id, consider moving to key based instead
    deletedS3Obj({ id: id });

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
      image: createdUrls,
    };

    updatedLineup({
      id: currS3Key,
      updatedData: updatedLineupObject,
    });
  };

  // TODO: show preview of the prev images, with correct order + which one is used as preview + viewable video
  return (
    <Layout title={`edit: ${lineup?.title}`}>
      <h1 className="text-bold my-2 text-center text-2xl font-bold">
        Editing Lineup
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
              placeholder={`${lineup?.title}`}
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
              <option placeholder={`${lineup?.agent}`} disabled={true}>
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
              <option placeholder={`${lineup?.map}`} disabled={true}>
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
              placeholder={`${lineup?.text}`}
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
              checked={lineup?.isSetup === true ? true : false}
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

export default EditLineup;
