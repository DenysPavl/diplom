import React, { useRef} from "react";

export default function ImageUpload({setImage}){

    //const[image,setImage] = useState();
    const image = useRef();

    function convertToBase64(e){

        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (e.target.files[0].size > maxFileSize) {
          alert("File size exceeds the limit of 5MB");
          return;
        }

        var reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload =()=>{
            setImage(reader.result)
            image.current = reader.result;
        };
        reader.onerror=error=>{
            console.log("Error: ",error);
            alert(error);
        }
    }

    return(
        <div className="auth-wrapper">
            <div className="auth-inner" style={{width: "auto"}}>
                Let's Upload Image
                <input type="file" accept="image/*" onChange={convertToBase64} />
                {image.current == ""|| image.current==null ? "" : <img width={100} height={100} src={image.current} />}
            </div>
        </div>
    )
}