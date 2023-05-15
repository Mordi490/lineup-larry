import { useDropzone } from "react-dropzone";
import Image from "next/image";

const BasicDropzone = ({
  files,
  onChangeFile,
  previewImg,
  setPreviewImg,
}: {
  files: File[];
  onChangeFile: (file: File[]) => void;
  previewImg: number;
  setPreviewImg: (e: number) => void;
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 6, // 3-4 imgs + 1-2 vids should cover a single lineup + some variations
    maxSize: 1024 * 1024 * 60, // single file limit @ 60 MB
    accept: {
      "image/*": [],
      "video/*": [],
    },
    onDrop: (acceptedFiles) => {
      // consider fetching the URLS as soon as the files are dropped
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
