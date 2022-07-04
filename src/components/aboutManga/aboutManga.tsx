import React, { useRef,useEffect,useState,useReducer } from 'react';
import {useLocation,useSearchParams,useNavigate,createSearchParams} from 'react-router-dom';
import './aboutManga.css';
import {backendUrl,scaperUrl}  from '../../global';
import { action_add_about_manga_object } from '../../reducers/actions';
import { store } from '../../index';
import { connect } from 'react-redux';

const AboutMangaComponent = (props:any) =>{
    const location = useLocation();
    const isMobile = require('is-mobile');
    const navigate = useNavigate();



    const [searchParams, setSearchParams] = useSearchParams();
    let [aboutMangaObj, setAboutMangaObj] = useState<React.SetStateAction<any>>({});
    let [isLoading,toggleIsLoading] = useState<React.SetStateAction<boolean>>(true);
    let [isDataLoaded,toggleIsDataLoaded] = useState<React.SetStateAction<boolean>>(false);
    let [state, setState] = useState<React.SetStateAction<any>>({});
    let [isUserDataLoaded,toggleIsUserDataLoaded] = useState<React.SetStateAction<boolean>>(false);
    let [dontBookmarkShowSpinner,toggleBookmarkSpinner] = useState<React.SetStateAction<boolean>>(false);
    let [userDataObject,setUserDataObject] = useState<React.SetStateAction<any>>({});
    
    const bgCont = useRef<HTMLDivElement>(null);
    const aboutThumb =  useRef<HTMLDivElement>(null);
    const topBarBtn =  useRef<HTMLButtonElement>(null);
    const mobileInnerContainer = useRef<HTMLDivElement>(null);
    const aboutBottomCont = useRef<HTMLDivElement>(null);
    const bookmarkBtn =  useRef<HTMLButtonElement>(null);
    const readNowBtn =  useRef<HTMLButtonElement>(null);
    const doubleBounce =  useRef<HTMLDivElement>(null);
    const doubleBounce2 =  useRef<HTMLDivElement>(null);
    const bookmarkSpinnerWrap =  useRef<HTMLDivElement>(null)



    useEffect(()=>{ 
        




        setState(location.state)
        loadManga(state);
        if(isDataLoaded && props.currentSrc.length !==0 && Object.keys(props.aboutMangaObject).length !== 0){
            if(isUserDataLoaded === false){
                getUserData();
                toggleIsUserDataLoaded(true);
            }
        }

        if(Object.keys(props.aboutMangaObject).length !== 0 && isDataLoaded === false){
            //load from props
            setAboutMangaObj(props.aboutMangaObject)
            toggleIsDataLoaded(true)
            toggleIsLoading(false)
            
        }else{
            if(isDataLoaded === false){
                getDetails(decodeURIComponent(String(searchParams.get("link"))))
                toggleIsDataLoaded(true)
            }
            if(Object.keys(state).length !== 0 && Object.keys(aboutMangaObj).length !== 0){
                toggleIsLoading(false)
            }
        }
    })

    const getUserData = async()=>{
        const response = await fetch(backendUrl+'getUserData',{
            method: 'POST',
            credentials:'include',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                title: aboutMangaObj.title,
                src:getSrcFromLink(),
            })
        })

        if(response){
            const jsonResp = await response.json();
            setUserDataObject(jsonResp.result)
            toggleBookmarkSpinner(true)
        }
    }

    const goBack = (e:React.MouseEvent| React.TouchEvent) =>{
        e.stopPropagation();
        store.dispatch(action_add_about_manga_object({}));
        navigate(-1);
    }

    const openReader = async(e:React.MouseEvent| React.TouchEvent,url:string,index:number) =>{
        e.stopPropagation();
        const response = await fetch(backendUrl+'addToHistory',{
            method: 'POST',
            credentials:'include',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                title: aboutMangaObj.title,
                src:getSrcFromLink(),
                link:decodeURIComponent(String(searchParams.get("link"))),
                thumbLink:aboutMangaObj.thumb,
                chapterIndex: aboutMangaObj.chapterList.length-index-1
            })
        })

        if(response.ok){
            const jsonResp = await response.json();
            if(url.length !== 0){
                const params = createSearchParams({
                    link: encodeURIComponent(url),
                    mangaLink:decodeURIComponent(String(searchParams.get("link"))),
                    currentChapterIndex: String(index)
                }).toString()
                url = 'read?' + params
                navigate(url,{state:{colorObj: state.colorObj}})
            }
        }else{
            alert("ERROR ADDING MANGA TO HISTORY")
        }     
    }
    const getSrcFromLink = () =>{
        const link = decodeURIComponent(String(searchParams.get("link")))
        let src = ''
        Object.keys(props.srcObject).forEach(e => {
            // console.log(props.srcObject[e])
            const domain = props.srcObject[e].domain;
            if(link.includes(domain)){
                src = e;
            }
        });
        return src
    }
    const handleBookMark = async(e:React.MouseEvent| React.TouchEvent)=>{
        e.stopPropagation();
        toggleBookmarkSpinner(false);

        


        const dataObj = {title: aboutMangaObj.title,
                src:getSrcFromLink(),
                link:decodeURIComponent(String(searchParams.get("link"))),
                thumbLink:aboutMangaObj.thumb,
        };

        const response = await fetch(backendUrl+'addToBookmarks',{
            method: 'POST',
            credentials:'include',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify(dataObj)
        })

        if(response.ok){
            getUserData();
        }


    }

    const loadManga = (state:any) =>{

        if( dontBookmarkShowSpinner === true &&  Object.keys(userDataObject).length !== 0){
            if(readNowBtn.current && bookmarkBtn.current){
                if(userDataObject.isBookmarked === 'YES'){
                    bookmarkBtn.current.style.background = state.colorObj.highLightBgColor;
                    bookmarkBtn.current.style.color = state.colorObj.highLightAccentColor;
                }else{
                    bookmarkBtn.current.style.background = state.colorObj.secondaryBgColor;
                    bookmarkBtn.current.style.color = state.colorObj.accentColor;
                }
                readNowBtn.current.style.background = state.colorObj.secondaryBgColor;
                readNowBtn.current.style.color = state.colorObj.accentColor;
            }
            
            
        }


        if(bgCont.current && aboutThumb.current && aboutBottomCont.current && topBarBtn.current && mobileInnerContainer.current){
            bgCont.current.style.background = `url(${aboutMangaObj.thumb})`;   
            aboutThumb.current.style.background = `url(${aboutMangaObj.thumb})`;
            topBarBtn.current.style.color = state.colorObj.accentColor;
            topBarBtn.current.style.background = state.colorObj.secondaryBgColor + "8a";
            mobileInnerContainer.current.style.color = state.colorObj.accentColor;
            aboutBottomCont.current.style.background = state.colorObj.bgColor;
            // doubleBounce.current.style.background =  state.colorObj.accentColor;
            // doubleBounce2.current.style.background =  state.colorObj.accentColor;
        }
        
    }

    
    const getDetails = async (url:string) => {
        const response = await fetch(scaperUrl+'getMangaInfo',{
            method: 'POST',
            headers:{
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'url': url
            })
        })
        if(response.ok){
            const jsonResp = await response.json();
            
            setAboutMangaObj(jsonResp.mangaInfo)
            store.dispatch(action_add_about_manga_object(jsonResp.mangaInfo));
        }
    }
    return(
        <div className="about-manga-wrapper">
            {
                isMobile()?
                <div className="about-manga-mobile-outer-container">
                    {
                        isLoading?
                        <div className="about-manga-loader-wrap">
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
                        </div>:
                        <div ref={mobileInnerContainer} className="about-manga-mobile-inner-container">
                            <div ref={bgCont} className="background-about">
                                <div className="blur-bg"/>
                            </div>
                            <div className="about-manga-top-container">
                                <div className="about-manga-top-bar">
                                    <button onClick={(e)=>goBack(e)} ref={topBarBtn} className="about-top-bar-btn">
                                        <span className="material-symbols-outlined">
                                            chevron_left
                                        </span>
                                    </button>
                                </div>
                                <div ref={aboutThumb} className="about-thumb"/>
                            </div>
                            <div ref={aboutBottomCont} className="about-manga-bottom-container">
                                <p className="about-manga-title">
                                    {aboutMangaObj.title}
                                </p>
                                {
                                    aboutMangaObj.author !== "" ? 
                                    <p className="about-manga-author">
                                        By {aboutMangaObj.author}
                                    </p>:null
                                }
                                <p className="about-manga-status">
                                    {aboutMangaObj.status.toLowerCase() === "ongoing" ? String.fromCodePoint(0x1F7E2):  String.fromCodePoint(0x2705)}
                                    {String.fromCodePoint(0x00A0)+String.fromCodePoint(0x00A0)}
                                    {aboutMangaObj.status}
                                </p>
                                <div className="about-manga-option-wrap">
                                    {
                                    dontBookmarkShowSpinner?
                                    <div className="about-manga-option-inner-wrap">
                                        <button onClick={(e)=>handleBookMark(e)}  ref={bookmarkBtn} className="about-manga-bookmark">
                                            <span className="material-symbols-outlined">
                                                bookmark
                                            </span>
                                        </button>
                                        <button onClick={(e)=>openReader(e,aboutMangaObj.chapterList[aboutMangaObj.chapterList.length - userDataObject.chapterIndex - 1].chapterLink,userDataObject.chapterIndex)}  ref={readNowBtn} className="about-manga-read-button">
                                            {
                                                userDataObject.chapterIndex === 0 ? "Start" : "Read: "+ aboutMangaObj.chapterList[aboutMangaObj.chapterList.length - userDataObject.chapterIndex - 1].chapterTitle
                                            }
                                        </button>
                                    </div>
                                    :
                                    <div ref={bookmarkSpinnerWrap} className="about-manga-option-spinner-wrap">
                                        <div className="bookmark-spinner">
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
                                    </div>
                                    
                                    }
                                </div>
                                <p className="about-manga-header">
                                    Synopsis
                                </p>
                                <p className="about-manga-synopsis">
                                    {aboutMangaObj.desc}
                                </p>
                                <p className="about-manga-header">
                                    Chapters
                                </p>
                                <div className="about-manga-chapter-wrap">
                                    {
                                        isUserDataLoaded && dontBookmarkShowSpinner?
                                        aboutMangaObj.chapterList.map((item:any,index:any)=>{
                                            if(item !== undefined)
                                            return <div onClick={(e)=>openReader(e,item.chapterLink,index)} key={index} style={{background: userDataObject.chapterIndex === aboutMangaObj.chapterList.length - index - 1 ? state.colorObj.highLightBgColor: state.colorObj.secondaryBgColor}} className="about-manga-chapter-item-wrap">
                                                        <span className="about-manga-chapter-title">{item.chapterTitle}</span>
                                                        <span className="about-manga-chapter-date">{item.chapterDate}</span>
                                                    </div>
                                            else
                                                console.log(item)

                                        }):
                                        <div className="chapter-full-loader">
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
                                    }
                                </div>
                                <div className="about-manga-bottom-margin"/>
                            </div>
                        </div>
                    }
                </div>:
                null
            }
        </div>
    )
}

function mapStateToProps(state:any) {
    return state;
}

export default connect(mapStateToProps)(AboutMangaComponent);
  