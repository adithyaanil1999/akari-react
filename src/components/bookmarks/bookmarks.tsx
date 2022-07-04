import React, { FunctionComponent,useRef,useEffect,useState } from 'react';
import './bookmarks.css';
import { connect } from 'react-redux';
import {backendUrl}  from '../../global';



interface BookMarkProps {
    getColors: any;
    openAboutPage: (url:string) => void;
}  

const BookmarkComponent: FunctionComponent <BookMarkProps> = (props:any) =>{

    let [isComicBool,toggleIsComic] = useState<React.SetStateAction<boolean>>(false);
    let [isBookMarkObjSet,setBookMarkObject] = useState<React.SetStateAction<boolean>>(false);
    let [bookMarkObj,setBookMarkObj] = useState<React.SetStateAction<any>>([]);
    let [bookMarkObjRead,setBookMarkObjRead] = useState<React.SetStateAction<any>>([]);
    let [bookMarkObjNotRead,setBookMarkObjNotRead] = useState<React.SetStateAction<any>>([]);
    let [showSpinner,toggleSpinner] = useState<React.SetStateAction<boolean>>(true);
    let [showOnlySearched,toggleShowOnlySearch] = useState<React.SetStateAction<boolean>>(false);
    let [searchObj,setSearchObj] = useState<React.SetStateAction<any>>([]);
    
    const srcObj = props.srcObject;
    const bookMarkSearchInp = useRef<HTMLInputElement>(null);
    useEffect(()=>{
        if(isBookMarkObjSet === false){
            // fetch bookmarks from backend
            getUserBookmarks();
            setBookMarkObject(true);
        }

    });
    
    const getUserBookmarks = async() =>{
        const response = await fetch(backendUrl+'getUserBookmarks',{
            method: 'POST',
            credentials:'include',
            headers:{
                'Content-type': 'application/json'
            },
        })

        if(response){
            let jsonResp = await response.json();
            if(jsonResp.result === 0){
                toggleSpinner(false);
            }else{

                let readArr = [];
                let unreadArr = [];

                for(let i = 0; i< jsonResp.result.length;i++){
                    jsonResp.result[i].unread_count === 0 ? readArr.push(jsonResp.result[i]):unreadArr.push(jsonResp.result[i]); 
                }
                setBookMarkObj(jsonResp.result);
                setBookMarkObjRead(readArr);
                setBookMarkObjNotRead(unreadArr);
                toggleSpinner(false);
            
                
            }
        }
    }

    const toggleMode = (e:React.MouseEvent)=>{
        e.stopPropagation();
        if(isComicBool === true){
            toggleIsComic(false);
        }else{
            toggleIsComic(true);
        }
    };

    const handleBookmarkSearch = () =>{
        if(bookMarkSearchInp.current){
            const val = bookMarkSearchInp.current.value;
            let tempArr:Array<any> = [];
            if(val.length !== 0){
                bookMarkObj.forEach((element:any) => {
                    console.log(element.title.includes(val))
                    if(element.title.toLowerCase().includes(val) === true){
                        console.log(element.title)
                        tempArr.push(element)
                    }
                });
                setSearchObj(tempArr);
                toggleShowOnlySearch(true)
            }else{
                setSearchObj([]);
                toggleShowOnlySearch(false)
            }   
        }
    }

    return(
        <div className="bookmark-wrap">
            <div style={{display:`${showSpinner?'flex':'None'}`}} className="bookmark-spinner-wrap">
                <div className="lds-roller">
                        <div>
                        </div>
                        <div>
                        </div>
                        <div>
                        </div>
                        <div>
                        </div>
                        <div>
                        </div>
                        <div>
                        </div>
                        <div>
                        </div>
                        <div>  
                        </div>
                        </div>
            </div>
            <div style={{display:`${bookMarkObj.length === 0?'flex':'None'}`,color: props.getColors.highLightBgColor}} className="bookmark-empty-wrap">
                <h1>You havent bookmarked anything, Yet.</h1>
            </div>
            {
                bookMarkObj.length !== 0 ?
                <div style={{display:`${showSpinner ?'None':'flex'}`}} className="bookmark-header-wrap">
                    <h1 style={{color: props.getColors.accentColor}}> Bookmarks</h1>
                    <div className="bookmark-toggle-wrap">
                        <div style={{background: props.getColors.secondaryBgColor}} className="bookmark-toggle">
                            <div onClick={(e)=>toggleMode(e)} style={{ background: props.getColors.accentColor,  transform: `${isComicBool?'translateX(100%)':'translateX(10%)'}`}} className="bookmark-toggle-icon-wrap">
                                <div style={{color: props.getColors.highLightAccentColor}}> 
                                        <span style={{display:`${isComicBool?'block':'None'}`}}>C</span>
                                        <span style={{display:`${isComicBool?'None':'block'}`}}>M</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>:null
            }
            
            <div style={{display:`${bookMarkObj.length !== 0?'flex':'None'}`}} className="bookmark-search-bar-wrap">
                <div style={{background:props.getColors.secondaryBgColor,color:props.getColors.accentColor}} className="search-bar">
                    <div className="search-icon-wrap">
                        <span className="material-symbols-outlined">
                            search
                        </span>
                    </div>
                    <div className="search-input-wrap ">
                        <input onKeyUp={handleBookmarkSearch} ref={bookMarkSearchInp}type="text" placeholder="Search Bookmarks" className="search-input"/>
                    </div>
                </div>
            </div>
            <div style={{display:`${showSpinner?'None':'flex'}`}} className="bookmark-body-wrap">  
                {
                    showOnlySearched?
                    searchObj.map((e:any,i:number)=>{
                        return <div key={i} className="bookmark-item-wrap">
                                    <div onClick={()=>props.openAboutPage(e.link)} style={{background:`linear-gradient(rgb(94 94 94 / 14%), rgb(4 4 4 / 96%)),url(${e.thumb_link})`}} className="bookmark-thumb-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {e.title}
                                        </span>
                                    </div>
                                    <div className="bookmark-src-title-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {srcObj[e.src].name}
                                        </span>
                                    </div>
                                    <div style={{background:props.getColors.highLightBgColor}} className="bookmark-under-counter-wrap">
                                        <span style={{color:props.getColors.highLightAccentColor}}>
                                            {e.unread_count}
                                        </span>
                                    </div>
                                </div>
                    }):
                    Object.keys(srcObj).length !== 0 ?
                    bookMarkObjNotRead.map((e:any,i:number)=>{
                        if(isComicBool === false){
                            if(Object.keys(srcObj).includes(e.src) && srcObj[e.src].type === 'manga'){
                                return <div key={i} className="bookmark-item-wrap">
                                    <div onClick={()=>props.openAboutPage(e.link)} style={{background:`linear-gradient(rgb(94 94 94 / 14%), rgb(4 4 4 / 96%)),url(${e.thumb_link})`}} className="bookmark-thumb-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {e.title}
                                        </span>
                                    </div>
                                    <div className="bookmark-src-title-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {srcObj[e.src].name}
                                        </span>
                                    </div>
                                    <div style={{background:props.getColors.highLightBgColor}} className="bookmark-under-counter-wrap">
                                        <span style={{color:props.getColors.highLightAccentColor}}>
                                            {e.unread_count}
                                        </span>
                                    </div>
                                </div>
                            }
                        }else{
                            if(Object.keys(srcObj).includes(e.src) && srcObj[e.src].type !== 'manga'){
                                return <div key={i} className="bookmark-item-wrap">
                                    <div onClick={()=>props.openAboutPage(e.link)} style={{background:`linear-gradient(rgb(94 94 94 / 14%), rgb(4 4 4 / 96%)),url(${e.thumb_link})`}} className="bookmark-thumb-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {e.title}
                                        </span>
                                    </div>
                                    <div className="bookmark-src-title-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {srcObj[e.src].name}
                                        </span>
                                    </div>
                                    <div style={{background:props.getColors.highLightBgColor}} className="bookmark-under-counter-wrap">
                                        <span style={{color:props.getColors.highLightAccentColor}}>
                                            {e.unread_count}
                                        </span>
                                    </div>
                                </div>
                            }
                        }
                    }):null
                }
                {
                    Object.keys(srcObj).length !== 0 && showOnlySearched === false  ?
                    bookMarkObjRead.map((e:any,i:number)=>{
                        if(isComicBool === false){
                            if(Object.keys(srcObj).includes(e.src) && srcObj[e.src].type === 'manga'){
                                return <div key={i} className="bookmark-item-wrap">
                                    <div onClick={()=>props.openAboutPage(e.link)} style={{background:`linear-gradient(rgb(94 94 94 / 14%), rgb(4 4 4 / 96%)),url(${e.thumb_link})`}} className="bookmark-thumb-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {e.title}
                                        </span>
                                    </div>
                                    <div className="bookmark-src-title-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {srcObj[e.src].name}
                                        </span>
                                    </div>
                                </div>
                            }
                        }else{
                            if(Object.keys(srcObj).includes(e.src) && srcObj[e.src].type !== 'manga'){
                                return <div key={i} className="bookmark-item-wrap">
                                    <div onClick={()=>props.openAboutPage(e.link)} style={{background:`linear-gradient(rgb(94 94 94 / 14%), rgb(4 4 4 / 96%)),url(${e.thumb_link})`}} className="bookmark-thumb-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {e.title}
                                        </span>
                                    </div>
                                    <div className="bookmark-src-title-wrap">
                                        <span style={{color:props.getColors.accentColor}}>
                                            {srcObj[e.src].name}
                                        </span>
                                    </div>
                                </div>
                            }
                        }
                    }):null
                }
               
            </div>
        </div>
    )
}

function mapStateToProps(state:any) {
    return state;
  }
  

export default connect(mapStateToProps)(BookmarkComponent);