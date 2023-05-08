import { useDropzone } from "react-dropzone";
import Image from "next/image";

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
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
      "video/*": [],
    },
    onDrop: (acceptedFiles) => {
      onChangeFile(acceptedFiles);
    },
  });

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
    </div>
  ));

  return (
    <>
      <section className="rounded-lg border-2 border-dashed border-black bg-gray-400 px-8 py-4">
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <p>
            Drag &apos;n&apos; drop some files here, or click to select files
          </p>
        </div>
        <aside>
          <ul>{Thumbnail}</ul>
        </aside>
      </section>
    </>
  );
};

export default BasicDropzone;
