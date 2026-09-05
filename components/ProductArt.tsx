import Image from "next/image";

export function ProductArt({colors,image,className=""}:{colors:string[];image?:string;className?:string}){
  if(image) return <div className={`product-art product-photo ${className}`}><Image src={image} alt="" fill sizes="(max-width: 768px) 50vw, 25vw"/></div>;
  return <div className={`product-art ${className}`} style={{"--a":colors[0],"--b":colors[1],"--c":colors[2]} as React.CSSProperties} aria-hidden="true"><span/><i/><b/></div>
}
