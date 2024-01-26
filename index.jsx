import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { AiOutlineDownload } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import LoadingDots from "../components/loading-dots";

export default function Home() {
  // states
  const canvasRef = useRef(null);
  const [processed, setprocessed] = useState(false);
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.API_KEY;
  const apiUrl = process.env.API_URL;

  // save canvas image
  const handleSaveImage = () => {
    if (canvas) {
      try {
        canvas.discardActiveObject();
        canvas.renderAll();
        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 2,
        });

        // Create a virtual link and trigger a click to download the canvas
        const link = document.createElement("a");
        link.download = `Yeezy_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        alert("Downloaded!!!");
        setprocessed(false);
        setCanvas(null);

        // hide the canvas parents afterdownlaoding the canvas.
        document.getElementById("canvasparent").style.display = "none";
      } catch (error) {
        alert("Failed to downlaod!");
        setprocessed(false);
        console.log(error);
      }
    }
  };

  // Remove image background
  const handleRemoveBg = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image_file", file, file.name);
      formData.append("size", "auto");

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
        },
        body: formData,
      });

      if (!res.ok) {
        alert("Error removing background!");
        throw new Error(`Error: ${res.status} - ${res.statusText}`);
      }

      const data = await res.blob();
      const dataUrl = URL.createObjectURL(data);
      return dataUrl;
    } catch (error) {
      throw error;
    }
  };

  // handle image selection and processing...
  const handleImageChange = async (event) => {
    setLoading(true);
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
    });

    setCanvas(newCanvas);

    // grab the selected file
    const file = event.target.files[0];

    if (file && file.type.startsWith("image/")) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File size exceeds the maximum allowed (4MB).");
        return;
      }
      const reader = new FileReader();

      // adjust and fit the foreground and bacakground image to the canvas
      try {
        // process user image
        const dataUrl = await handleRemoveBg(file);
        reader.onload = function (f) {
          fabric.Image.fromURL(dataUrl, function (userImage) {
            const scale = newCanvas.width / userImage.width / 3; // Adjust '3' as needed
            userImage.scale(scale).set({
              left: newCanvas.width / 2.7,
              top: newCanvas.height / 2.2,
              originX: "center",
              originY: "center",
            });

            // Remove existing objects
            newCanvas.getObjects().forEach(function (obj) {
              newCanvas.remove(obj);
            });

            // Add the user-selected image to the canvas
            newCanvas.setBackgroundImage(
              userImage,
              newCanvas.renderAll.bind(newCanvas)
            );

            // process the YEEZY shoe as the foreground image
            // Load static image from /public/yeezy_frame.png
            const staticImagePath = "/yeezy_frame.png";

            fabric.Image.fromURL(staticImagePath, function (img) {
              img.set({
                scaleX: newCanvas.width / img.width,
                scaleY: newCanvas.height / img.height,
                hasControls: true, // Enable controls for resizing and moving
                selectable: true, // Make the bottle selectable
              });
              newCanvas.add(img);
            });

            newCanvas.renderAll();
          });
        };

        reader.readAsDataURL(file);

        alert("Yeezy successfully created!!!");
        setLoading(false);
        setprocessed(true);
        document.getElementById("canvasparent").style.display = "block";
      } catch (error) {
        console.log(error);
      }
    } else {
      setLoading(false);
      setprocessed(false);
      alert("Please select an image");
      setSelectedImage(null);
      setBgRemove(null);
    }
  };

  // make sure not to display the canvas on screen sizes less than 1024 because of the size  and qaulity of the canvas
  // useEffect(() => {
  //   if (processed) {
  //     window.innerWidth >= 1024 ? setshowCanvas(true) : setshowCanvas(false);
  //   } else {
  //     document.getElementById("canvasparent").style.display = "none";
  //   }
  //   console.log(processed, window.innerWidth);
  // }, [processed]);

  return (
    <div className="min-h-screen   justify-center bg-gradient-to-r bg-black text-white flex flex-col items-center pt-5 px-16 max-md:px-5">
      <div className="flex w-full  max-w-[1480px] flex-col mt-2.5 max-md:max-w-full">
        <div className="backdrop-blur-[10px]   bg-white bg-opacity-10 self-stretch flex w-full items-center justify-between gap-5 pl-16 pr-8 max-md:py-2 py-6 rounded-[50px] max-md:max-w-full max-md:flex-wrap max-md:px-5">
          <Link href={"#"} className="text-4xl max-md:text-lg  font-bold">
            Yeezy
          </Link>

          <a
            href="#"
            className="text-black hover:bg-[#9945FF] hover:text-white text-center text-xl  border-2 border-[#14F195]  max-md:text-sm font-bold whitespace-nowrap bg-zinc-300 bg-opacity-80 justify-center items-stretch px-9 py-4 rounded-[30px] max-md:px-5"
          >
            Buy Yeezy
          </a>
        </div>
        <div className="text-center text-7xl font-extrabold bg-clip-text self-center mt-14 max-md:max-w-full max-md:text-4xl max-md:mt-10">
          Yeezy Revolution
        </div>

        <div className="text-white text-center max-md:text-xl text-3xl font-light self-center max-w-[924px] mt-12 max-md:max-w-full max-md:mt-10">
          Ready to inject style into every step and turn it into a fashionable
          statement? With Yeezy Move, each stride becomes a symbol of
          trendsetting. Simply walk, run, or move with flair to earn. Every step
          sets the pace for a stylish journey.
        </div>

        {/*  */}

        {loading && (
          <div className="my-10 text-center  w-full">
            <LoadingDots color="#9945FF" />
          </div>
        )}

        <div id="canvasparent" className="   mx-auto mt-5">
          <div className=" hidden lg:block ">
            <canvas
              className="z-50 hidden  lg:block w-full"
              ref={canvasRef}
              id="c"
            />
            {processed && (
              <p className="hidden lg:block  italic  mx-auto  my-2 text-xl max-w-lg text-center">
                Elevate your Yeezy experience by customizing the canvas to match
                your unique style. Feel free to drag and adjust to achieve the
                perfect fit for your image. Yeezy on!
              </p>
            )}
          </div>

          {processed && (
            <>
              <h2 className="text-4xl font-bold bg-gradient-to-r lg:hidden from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
                Congratulation Your Yeezy Shoe is ready!!!
              </h2>
            </>
          )}
        </div>

        <div className="flex mb-10  items-center  max-w-md  mx-auto mt-14 max-md:flex-col  max-md:space-y-5">
          {!processed && (
            <div class="flex w-full  items-center justify-center bg-grey-lighter">
              <label class="w-64 flex flex-col items-center px-4 py-6  text-blue rounded-lg shadow-lg tracking-wide uppercase border  border-[#14F195] cursor-pointer hover:bg-blue hover:text-white">
                <svg
                  class="w-8 h-8"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                </svg>
                <span class="mt-2 text-base leading-normal">
                  Select an image
                </span>
                <input
                  onChange={handleImageChange}
                  type="file"
                  accept="image/*"
                  class="hidden"
                />
              </label>
            </div>
          )}
          {processed && (
            <button
              onClick={handleSaveImage}
              class="group flex  items-center justify-center space-x-2 relative h-12 w-48 overflow-hidden rounded-2xl bg-green-500 text-lg font-bold text-white"
            >
              <p>Save Yeezy </p>
              <span>
                {" "}
                <AiOutlineDownload />
              </span>
              <div class="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30"></div>
            </button>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
