import {useState,useEffect} from 'react'
export default function useLocalStorage(key,init){
  const [v,setV]=useState(()=>{try{const r=localStorage.getItem(key);return r?JSON.parse(r):init}catch{return init}})
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(v))}catch{/* quota */}},[key,v])
  return [v,setV]
}
