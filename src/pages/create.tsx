import { Active, closestCenter, DndContext, DragEndEvent, DragStartEvent, KeyboardSensor, MouseSensor, PointerSensor, TouchSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ui/button";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaDiscord } from "react-icons/fa";
import * as z from "zod";
import { agentZodYes, mapZodYes } from "../../utils/enums";
import Layout from "../components/layout";
import { api } from "../utils/api";

// TODO: refactor this file, not today tho

export const MAX_FILE_SIZE = 1024 * 1024 * 80; // 80MB, for now

type imageFile = Record<string, any>;

// consider doing something similar to: https://codesandbox.io/s/dnd-kit-sortable-starter-template-22x1ix?file=/src/App.tsx:454-462
/*
interface BaseItem {
  id: UniqueIdentifier;
}

interface SortableFile<T extends BaseItem> {
  items: T[];
  onChange(items: T[]):void;
  renderItem(item: T): ReactNode;
}

export function SortableList<T extends BaseItem> ({items, onChange, renderItem}: SortableFile<T>) {
  
}
*/

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
  const [presignedUrls, setPresignedUrls] = useState<string[]>([])

  const { data: session } = useSession();
  const router = useRouter();


  // These are noe longer what we want
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
      <Layout title="Submit Lineup" name="Submit Lineup" description="Login & submit a lineup" >
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
      </Layout >
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
              <BasicDropzone setPresignedUrl={setPresignedUrls} presignedUrl={presignedUrls} previewImg={previewImg} setPreviewImg={setPreviewImg} files={field.value} onChangeFile={field.onChange} />
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

interface SortableFile {
  // core
  id: UniqueIdentifier;
  src: File;
  presignedUrl?: string
  // optionals
  width?: number;
  height?: number;
  alt?: string;
  onClickHandler?: () => void;
  index?: number;
}

const BasicDropzone = ({
  files,
  onChangeFile,
  previewImg,
  setPreviewImg,
  setPresignedUrl,
  presignedUrl,
}: {
  files: File[];
  onChangeFile: (file: File[]) => void;
  previewImg: number;
  setPreviewImg: (e: number) => void;
  setPresignedUrl: (urls: string[]) => void;
  presignedUrl: string[];
}) => {
  const [images, setImages] = useState<SortableFile[]>([])
  // I really dont think this is needed, but just in case
  const [active, setActive] = useState<Active | null>(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const { mutateAsync: createPresignedUrl2 } =
    api.lineup.createPresignedUrl.useMutation({
      onError: (err) => console.log("no", err),
      onSuccess: (res) => console.log("yes", res),
    });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
      // TODO: make the user be unable to select video files as previewImg
      "video/*": [],
    },
    onDrop: (acceptedFiles) => {
      onChangeFile(acceptedFiles);

      // TODO: make it work
      // request presigned URLs
      //fetchPresignedUrls({ numOfUrls: images.length })
      // assign the given urls to our files
      //assignPresignedUrls({ urls: presignedUrl })
    },
  });

  useEffect(() => {
    console.log(presignedUrl);
  }, [presignedUrl])

  // UseEffect to always have the correct shape for the object drag thing
  useEffect(() => {
    const fileObjects: SortableFile[] = [];
    for (let i = 0; i < files.length; i++) {
      fileObjects[i] = { id: i, src: files?.[i] as File };
    }
    // hope this works, edit: gives infinite loop :()
    setImages(fileObjects);
    //console.log("UseEffect ran!, images are now in the order of the fileDrop-thingy")
  }, [files])

  // function to request presigned url upon file drops, then assign them to the current file 
  const fetchPresignedUrls = ({ numOfUrls }: { numOfUrls: number }) => {
    console.log("requesting", numOfUrls, " urls")
    // assume that the images state has been updated
    images.map((myFile) => {
      createPresignedUrl2({ fileType: myFile.src.type })
        .then((res) => {
          console.log("success: ", res)
          setPresignedUrl([...presignedUrl, res.url]);
        })
        .catch((err) => console.log("err: ", err))
    })
  }

  /*
  const assignPresignedUrls = ({ urls }: { urls: string[] }) => {
    console.log("assigning:", presignedUrl, "\nto:", images);
    images.map((file, index) => file.src = urls[index]);
  }
  
  // keeping this here for refeErence: https://codesandbox.io/s/dndkit-sortable-image-grid-py6ve?file=/src/App.jsx 
  // This one too: https://codesandbox.io/s/dnd-kit-yarn-1-eelbb?file=/src/App.tsx:703-817 
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    console.log("active:", active)
    console.log("over:", over)

    if (active.id !== over?.id) {
      setImages((items) => {
        // I end up with null here now, hmmmmmm
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over!.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActive(null);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActive(event.active.id);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActive(null);
  }, []);

  */
  // TODO: don't use any
  const SortableImage = (props: SortableFile) => {
    //console.log(JSON.stringify(props))

    const fileBlob = URL.createObjectURL(props.src);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
    };

    // test src:
    // src="https://lh3.googleusercontent.com/proxy/pC1MXSS7mtIFrLs7a6A420rXED4tQ9FNlGg6TydyKsqXa6m6xozYiKCYBp97TOm99JAHi5vZgb3FO9iMLVbmr9x3Nw=w1200-h630-p-k-no-nu"
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative mx-4 my-2 inline-flex h-32 w-32 rounded">
        {props.id == previewImg ? (
          <div className="border-2 border-red-500">
            <div className="flex min-w-0 overflow-hidden">
              <Image src={fileBlob} width={props.width} height={props.height} alt={props.alt} onClick={props.onClickHandler}
              //nLoad={() => { URL.revokeObjectURL(fileBlob) }}
              />
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 overflow-hidden">
            <Image src={fileBlob} width={props.width} height={props.height} alt={props.alt} onClick={props.onClickHandler}
            //onLoad={() => { URL.revokeObjectURL(fileBlob) }}
            />
          </div>
        )}

      </div>
    )
  }

  const Thumbnail = files.map((file, index) => (
    <div
      className="relative mx-4 my-2 inline-flex 
   h-32 w-32 rounded"
      key={file.name}
    >
      {index == previewImg ? (
        <div className="border-2 border-red-500">
          <div className="flex min-w-0 overflow-hidden">
            <Image
              src={URL.createObjectURL(file)}
              key={index}
              alt="This image will be used for preview"
              onClick={() => setPreviewImg(index)}
              width={300}
              height={300}
            // Revoke data uri after image is loaded
            //onLoad={() => { URL.revokeObjectURL(file) }} // may or may not be important
            />
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 overflow-hidden">
          <Image
            src={URL.createObjectURL(file)}
            alt="preview of your files"
            width={300}
            onClick={() => setPreviewImg(index)}
            height={300}
          // Revoke data uri after image is loaded
          //onLoad={() => { URL.revokeObjectURL(file) }} // may or may not be important
          />
        </div>
      )}
    </div >
  ));

  /*
  const NewThumbNails = () => (
    <DndContext collisionDetection={closestCenter} sensors={sensors}
      onDragEnd={handleDragEnd} onDragStart={handleDragStart} onDragCancel={handleDragCancel}
    >
      <SortableContext items={images}>
        {images.map((e, index) => <SortableImage key={e.id} id={e.id} width={300} height={300} alt={`image of ${e.src.name}`} src={e.src} onClickHandler={() => setPreviewImg(index)} index={index} />)}
      </SortableContext>
    </DndContext >
  )
  */

  return (
    <>
      <section className="rounded-lg border-2 border-dashed border-black bg-gray-400 px-8 py-4">
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
        </div>
        <aside>
          <ul>{Thumbnail}</ul>
        </aside>
      </section>
    </>
  );
};


/**
 * for later
 * <div>
        <h2 className="text-xl font-semibold">dndkit previews here</h2>
        {images.length > 0 ? (<NewThumbNails />) : (null)}
      </div>
      <div className="flex justify-center space-y-4 flex-col">
        <h2>images</h2>
        <pre>{JSON.stringify(images, null, 4)}</pre>
        <h2>presignedUrl</h2>
        <pre>{JSON.stringify(presignedUrl, null, 4)}</pre>
      </div>
 */
export default Create;
