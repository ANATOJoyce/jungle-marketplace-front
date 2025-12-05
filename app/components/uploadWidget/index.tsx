import { useEffect, useRef, ReactNode } from "react";
import { useMatches } from "@remix-run/react";

interface UploadWidgetProps {
  onUpload: (url: string) => void;
  children?: ReactNode;
}

function UploadWidget({ onUpload, children }: UploadWidgetProps) {
  const matches = useMatches();

  //  Récupération des variables d’environnement passées par la route "root"
  const rootData = matches.find((route) => route.id === "root")?.data as
    | { ENV: { CLOUDINARY_CLOUD_NAME: string; CLOUDINARY_UPLOAD_PRESET: string } }
    | undefined;

  const ENV = rootData?.ENV;

  const widget = useRef<any>(null);

  //Fonction de création du widget
  function createWidget() {
    console.log("ENV utilisé dans widget :", ENV); 
    if (window.cloudinary && ENV) {
      return window.cloudinary.createUploadWidget(
        {
          cloudName: ENV.CLOUDINARY_CLOUD_NAME,
          uploadPreset: ENV.CLOUDINARY_UPLOAD_PRESET,
          sources: ["local", "url", "camera"],
          multiple: false,
          cropping: false,
          folder: "products",
        },
        (error: any, result: any) => {
          if (!error && result?.event === "success") {
            console.log(" Upload réussi :", result.info.secure_url);
            onUpload(result.info.secure_url);
          }
        }
      );
    }
  }

  //  Chargement du widget de manière paresseuse
  useEffect(() => {
    function onIdle() {
      if (!widget.current) {
        widget.current = createWidget();
      }
    }

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(onIdle);
    } else {
      setTimeout(onIdle, 0);
    }
  }, []);

  // Fonction d’ouverture du widget
  function open() {
    if (widget.current) {
      widget.current.open();
    }
  }

  // Rendu du bouton ou du `children` cliquable
  return children ? (
    <div onClick={open} className="cursor-pointer inline-block">
      {children}
    </div>
  ) : (
    <button
      type="button"
      onClick={open}
      className="px-4 py-2 bg-[#ee9f3c] text-white rounded-lg shadow hover:bg-opacity-90"
    >
      Upload une image
    </button>
  );
}

export default UploadWidget;
