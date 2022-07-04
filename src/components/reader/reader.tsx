import React, {  Dispatch,useRef,useEffect,useState, FunctionComponent,useReducer } from 'react';
import {useLocation,useSearchParams,useNavigate} from 'react-router-dom';
import './reader.css';
import Cookies from 'universal-cookie';
import {backendUrl,scaperUrl}  from '../../global';
import { store } from '../../index';
import { connect } from 'react-redux';
import { action_add_about_manga_object } from '../../reducers/actions';
import { createImportSpecifier } from 'typescript';



const ReaderComponent = (props:any) =>{

    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const cookies = new Cookies();

    
    let [imageList, setImageList] = useState<React.SetStateAction<any>>([]);
    let [imageCount, setImageCount] = useState<React.SetStateAction<number>>(0);
    let [loadCount, setLoadCount] = useState<React.SetStateAction<any>>([]);
    let [isDataLoaded,toggleIsDataLoaded] = useState<React.SetStateAction<boolean>>(false);
    let [isImagesLoaded,toggleIsImagesLoaded] = useState<React.SetStateAction<boolean>>(false);
    let [state, setState] = useState<React.SetStateAction<any>>({});
    let [isScrollingVertical,toggleScrollingVertical] = useState<React.SetStateAction<boolean>>(false);
    let [prevScrollTick,setPrevScrollTick] = useState<React.SetStateAction<number>>(-1);
    let [menuTop,setMenuTop] = useState<React.SetStateAction<string>>('87%');
    let [topMenuTop,setTopMenuTop] = useState<React.SetStateAction<string>>('2%');
    let [isScrollTypeSet,setScrollType] = useState<React.SetStateAction<boolean>>(false);
    let [aboutMangaObj,setAboutMangaObject] = useState<React.SetStateAction<any>>({});
    let [isaboutMangaObjSet,toggleaboutMangaObjSet] = useState<React.SetStateAction<boolean>>(false);
    let [isaboutMangaObjloaded,toggleaboutMangaObjloaded] = useState<React.SetStateAction<boolean>>(false);
    let [currentChapterIndex,setCurrentChapterIndex] = useState<React.SetStateAction<number>>(-1);
    let [isGetImageCalled,toggleGetImageCalled] = useState<React.SetStateAction<boolean>>(false);
    let [isScrollTop,toggleIsScrollTop] = useState<React.SetStateAction<boolean>>(true);
    let [currentImageCount,setCurrentImageCount] = useState<React.SetStateAction<number>>(0);

    // let currentChapterIndex = -1;

    let refArrayOfImages = useRef<Array<HTMLDivElement | null>>([])
    const currentImage = useRef<HTMLImageElement>(null);
    const bottomMenu = useRef<HTMLDivElement>(null);
    const topMenu = useRef<HTMLDivElement>(null);
    const timer5ms = (res:string) => new Promise(res => setTimeout(res, 5))
    let currentCount = 0;

    useEffect(()=>{
        setState(location.state)

        // check if about manga prop is empty if empty load about manga object again; edge case

        if(isaboutMangaObjSet === false){
            if(Object.keys(props.aboutMangaObject).length === 0){
                // load again
                if(isaboutMangaObjloaded === false){
                    toggleaboutMangaObjloaded(true);
                    loadAboutManga();
                }
                
            }else{
                setAboutMangaObject(props.aboutMangaObject)
                toggleaboutMangaObjSet(true);
            }
        }else{
            if( isGetImageCalled === false && isDataLoaded === false){
                toggleGetImageCalled(true)
                toggleIsDataLoaded(true);
                getMangaUrls(decodeURIComponent(String(searchParams.get("link"))));

            }
        }
        
        // set scroll type from cookie

        if(isScrollTypeSet === false){
            //check current scroll type
            let type = cookies.get('scrollType');
            if(type === undefined){
                cookies.set('scrollType', 'Horizontal', { path: '/' });
                toggleScrollingVertical(false)
            }else if(type === 'Vertical'){
                cookies.set('scrollType', 'Vertical', { path: '/' });
                toggleScrollingVertical(true)
            }else if(type === 'Horizontal'){
                cookies.set('scrollType', 'Horizontal', { path: '/' });
                toggleScrollingVertical(false)
            }
            setScrollType(true)
        }
        if(isScrollingVertical === false){
            handleHorizontalScroll("start")
        }
        if(Object.keys(state).length !==0){
            setTheme();
        }
    })
    
    const goBack = (e:React.MouseEvent| React.TouchEvent) =>{
        e.stopPropagation();
        navigate(-1);
    }


    const getMangaUrls = async (url:string) =>{
        setImageCount(0);
        const response = await fetch(scaperUrl+'getImageList',{
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
            toggleIsDataLoaded(true)
            console.log(jsonResp)
            if(jsonResp.message === 'error'){
                alert("Something went wrong")
                navigate(-1);
            }else{
                preLoadImages(jsonResp.imageList);
            }

        }
    }

    const preLoadImages = async(images:Array<any>)=>{
        // load all images into an array <imageList>

        const loadImages = (images:any) => {
            console.log(images.length)
            return new Promise<Array<HTMLImageElement>>((resolve, reject) => {
                (function loadEach(images, index) {
                    if (index < images.length) {
                        let img = new Image();
                        img.src = images[index];
                        images[index] = img;
                        images[index].onload = function() {
                            loadEach(images, ++index);
                        };
                        images[index].onerror = (err:any) => reject(err);
                    } else {
                        resolve(images);
                    }
                })(images, 0)
            });
        }
        console.log(images.length)
        if(images.length>5){
            console.log("sectional loading")
            const imgArrSplitOne = images.slice(0,5)
            const imgArrSplitTwo = images.slice(5,images.length)
            // let imgArr:Array<any>;
            // let imgArr2:Array<any>;
            let imgArr:Array<any>= await loadImages(imgArrSplitOne)
            let imgArr2:Array<any>= await loadImages(imgArrSplitTwo)

            // [imgArr, imgArr2] = await Promise.all([loadImages(imgArrSplitOne), loadImages(imgArrSplitTwo)]);
            if(imgArr){
                console.log('img arr 1 loaded')
                setImageList(imgArr)
                setImageCount(imgArr.length)
                toggleIsImagesLoaded(true);
                if(imgArr2){
                    console.log('img arr 2 loaded')
                    let temp = imgArr.concat(imgArr2)
                    setImageList(temp)
                    setImageCount(temp.length)
                }
            }
            // if(imgArr2){
            // }

        }else{
            let imgArr:Array<any>= await loadImages(images);
            if(imgArr){
                setImageList(imgArr)
                setImageCount(imgArr.length)
                !isImagesLoaded? toggleIsImagesLoaded(true) : null;
            }
        }


        
    }

    const setTheme = ()=>{
        if(bottomMenu.current){
            bottomMenu.current.style.display = 'flex';
            bottomMenu.current.style.background = state.colorObj.secondaryBgColor+"d6";
            bottomMenu.current.style.color = state.colorObj.accentColor;
        }
        if(topMenu.current){
            topMenu.current.style.display = 'flex';
            topMenu.current.style.background = state.colorObj.secondaryBgColor+"d6";
            topMenu.current.style.color = state.colorObj.highLightAccentColor;
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

    const loadNextChapter = async(e:React.MouseEvent| React.TouchEvent | null)=>{
        if(e !== null){
            e.stopPropagation();
        }
        setCurrentImageCount(0);
        const chapterList = props.aboutMangaObject.chapterList;
        if(currentChapterIndex === -1){
            // currentChapterIndex = parseInt(decodeURIComponent(String(searchParams.get("currentChapterIndex"))))
            setCurrentChapterIndex(parseInt(decodeURIComponent(String(searchParams.get("currentChapterIndex")))));
            currentChapterIndex = parseInt(decodeURIComponent(String(searchParams.get("currentChapterIndex"))))
        }
        // currentChapterIndex = parseInt(decodeURIComponent(String(searchParams.get("currentChapterIndex"))))
        const index = parseInt(String(currentChapterIndex))
        
        if(index - 1 < 0){
            navigate(-1);
        }else{
            toggleIsImagesLoaded(false)
            // update history
            const dataObj = {
                title: aboutMangaObj.title,
                src:getSrcFromLink(),
                link: decodeURIComponent(String(searchParams.get("mangaLink"))),
                thumbLink:aboutMangaObj.thumb,
                chapterIndex: aboutMangaObj.chapterList.length-index
            }
            const response = await fetch(backendUrl+'addToHistory',{
                method: 'POST',
                credentials:'include',
                headers:{
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(dataObj)
            })

            if(response){
                setCurrentChapterIndex(index - 1);
                getMangaUrls(chapterList[index - 1].chapterLink);
            }
        }
        
    }

    const loadPrevChapter = async(e:React.MouseEvent| React.TouchEvent | null)=>{
        if(e !== null){
            e.stopPropagation();
        }
        const chapterList = props.aboutMangaObject.chapterList;
        if(currentChapterIndex === -1){
            // currentChapterIndex = parseInt(decodeURIComponent(String(searchParams.get("currentChapterIndex"))))
            setCurrentChapterIndex(parseInt(decodeURIComponent(String(searchParams.get("currentChapterIndex")))));
            currentChapterIndex = parseInt(decodeURIComponent(String(searchParams.get("currentChapterIndex"))))
        }
        
        const index = parseInt(String(currentChapterIndex))
       
        
        if(aboutMangaObj.chapterList.length-(index+2) < 0){
            navigate(-1);
        }else{
            toggleIsImagesLoaded(false)
            // update history
            const dataObj = {
                title: aboutMangaObj.title,
                src:getSrcFromLink(),
                link: decodeURIComponent(String(searchParams.get("mangaLink"))),
                thumbLink:aboutMangaObj.thumb,
                chapterIndex: aboutMangaObj.chapterList.length-(index+2)
            }

            const response = await fetch(backendUrl+'addToHistory',{
                method: 'POST',
                credentials:'include',
                headers:{
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(dataObj)
            })

            if(response){
                setCurrentChapterIndex(index + 1);
                getMangaUrls(chapterList[index + 1].chapterLink);
            }
        }
    }

    const toggleReader = (e:React.MouseEvent| React.TouchEvent,type:string) => {
        e.stopPropagation();
        if(type === "VERTICAL"){
            cookies.set('scrollType', 'Vertical', { path: '/' });
            toggleScrollingVertical(true);
        }else{
            cookies.set('scrollType', 'Horizontal', { path: '/' });
            const max = parseInt(String(imageCount))
            for(let i=0; i<max ;i++){
                refArrayOfImages.current.pop();
            }
            toggleScrollingVertical(false);
        }
    }

    const handleScroll = async(e: React.UIEvent<HTMLDivElement>) =>{
        const maxTop = 100;
        const minTop = 87;
        const getTopPercentage = (string:string) =>{
            if(string.length == 4){
                return parseInt(string.slice(0,3))
            }else if(string.length == 3){
                return parseInt(string.slice(0,2))
            }else{
                return parseInt(string.slice(0,1))
            }
        }

        if(isScrollingVertical){
            const div = e.target as HTMLDivElement;
            const currentTick = div.scrollTop;
            if(prevScrollTick < currentTick){
                //move the bottom both menu out of view
                if(bottomMenu.current){
                    const currentTop = getTopPercentage(String(menuTop));
                    if(currentTop <= maxTop){
                        const newTop  = String(currentTop + 1) + "%";
                        bottomMenu.current.style.top = newTop
                        setMenuTop(newTop);
                    }
                    
                }
                if(topMenu.current){
                    const maxTopTopMenu = -9;
                    const currentTop = getTopPercentage(String(topMenuTop));
                    if(currentTop > maxTopTopMenu){
                        const newTop  = String(currentTop - 1) + "%";
                        topMenu.current.style.top = newTop
                        setTopMenuTop(newTop);
                    }
                }
            }else{
                //move menus into view
                if(bottomMenu.current){
                    const currentTop = getTopPercentage(String(menuTop));
                    if(currentTop >= minTop){
                        const newTop  = String(currentTop - 1) + "%";
                        bottomMenu.current.style.top = newTop
                        setMenuTop(newTop);
                    }
                    
                }
                if(topMenu.current){
                    const maxTopTopMenu = 6;
                    const currentTop = getTopPercentage(String(topMenuTop));
                    if(currentTop < maxTopTopMenu){
                        const newTop  = String(currentTop + 1) + "%";
                        topMenu.current.style.top = newTop
                        setTopMenuTop(newTop);
                    }
                }

            }
            setPrevScrollTick(currentTick);
            if(currentTick === 0){
                toggleIsScrollTop(true);
                const maxTopTopMenu = 6;
                let currentTop = getTopPercentage(String(topMenuTop));
                while(true){
                    if(topMenu.current){
                        if(currentTop < maxTopTopMenu){
                            currentTop++;
                            const newTop  = String(currentTop) + "%";
                            topMenu.current.style.top = newTop
                            setTopMenuTop(newTop);
                            await timer5ms("return");
                        }else{
                            break;
                        }
                    }
                }
            }else if(currentTick === div.scrollHeight - div.clientHeight){
                toggleIsScrollTop(false);
                const maxTopTopMenu = 2;
                let currentTop = getTopPercentage(String(topMenuTop));
                while(true){
                    if(topMenu.current){
                        if(currentTop < maxTopTopMenu){
                            currentTop++;
                            const newTop  = String(currentTop) + "%";
                            topMenu.current.style.top = newTop
                            setTopMenuTop(newTop);
                            await timer5ms("return");
                        }else{
                            break;
                        }
                    }
                }
            }
        }
    }

    const handleHorizontalScroll = async(type:string) => {
        const maxRight =  parseInt(String(imageCount));

        if(type === "start"){
            currentCount = 0;
            // set first image display true;
            for(let i = 0 ; i < maxRight; i++){
                let temp = refArrayOfImages.current[i];
                if(temp){
                    if(i !== 0)
                        temp.style.display = 'none';
                    else{
                        temp.style.display = 'flex';
                    }
                }
            }
            
        }else if(type === "right"){
            // next page

            if(currentImage.current){
                const count:number = parseInt(String(currentImageCount))
                if(count < parseInt(String(imageCount)) - 1 ){
                    setCurrentImageCount(count + 1);

                }else{
                    // load next chapter
                    loadNextChapter(null);
                }
            }
            
        }else if(type === "left"){
            // prev page
            if(currentImage.current){
                const count:number = parseInt(String(currentImageCount))
                if(count >= 1 ){
                    setCurrentImageCount(count - 1);

                }else{
                    // load prev chapter
                    loadPrevChapter(null);
                }

            }
        }
        
    }

    const loadAboutManga = async() =>{
        const url = decodeURIComponent(String(searchParams.get("mangaLink")))
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
            if(jsonResp){
                console.log("About manga loaded")
            }
            store.dispatch(action_add_about_manga_object(jsonResp.mangaInfo));
            getMangaUrls(decodeURIComponent(String(searchParams.get("link"))));
            setAboutMangaObject(jsonResp.mangaInfo);
            toggleaboutMangaObjSet(true);
            toggleGetImageCalled(true);
        }
    }
    return(
        <div className="reader-outer-wrap">
            {
                isScrollingVertical && isImagesLoaded && Object.keys(state).length !==0?
                <div ref={topMenu} className="reader-top-menu-wrap">
                    <span onClick={(e)=>loadPrevChapter(e)} style={{display:`${isScrollTop?'flex':'None'}`}} className="reader-chapter-span-prev">
                        <span className="material-symbols-outlined">
                            keyboard_backspace
                        </span>
                        Previous Chapter
                    </span>
                    <span onClick={(e)=>loadNextChapter(e)} style={{display:`${isScrollTop?'None':'flex'}`}} className="reader-chapter-span-next">
                        Next Chapter
                        <span className="material-symbols-outlined">
                            arrow_right_alt
                        </span>
                    </span>
                </div>
                :null
            }
            <div style={{display:`${isImagesLoaded && Object.keys(state).length !==0 ?"none":"flex"}` , opacity:`${isImagesLoaded?"0":"1"}`}} className="reader-fullscreen-loader">
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
            <div onScroll={(e)=>handleScroll(e)} style={{opacity:`${isImagesLoaded?"1":"0"}`}} className="reader-main-wrap">
            {
                isScrollingVertical?
                imageList.map((e:any,i:number)=>{
                    return <img key={i} src={e.src}/>;
                })
                :
                <div className="reader-image-carousel-wrap">
                    {
                        <div className="reader-carousel-img-wrap">
                            <div className="touch-control-reader">
                                <div onClick={()=>handleHorizontalScroll("left")} className="touch-control-left"/>
                                <div onClick={()=>handleHorizontalScroll("right")} className="touch-control-right"/>
                            </div>
                            {
                                imageCount !== 0 ?
                                <img ref={currentImage} src={imageList[parseInt(String(currentImageCount))].src}/>:null
                            }
                        </div>
                    }
                </div>
            }
            </div>
            {
                isImagesLoaded && Object.keys(state).length !==0 ? 
                <div ref={bottomMenu} className="reader-bottom-menu-wrap">
                    <span onClick={(e)=>goBack(e)} className="material-symbols-outlined">
                        arrow_back_ios
                    </span>
                    <span onClick={(e)=>toggleReader(e,'VERTICAL')} style={{color:`${isScrollingVertical? state.colorObj.highLightAccentColor: state.colorObj.accentColor}` }} className="material-symbols-outlined">
                        view_agenda
                    </span>
                    <span onClick={(e)=>toggleReader(e,'HORIZONTAL')} style={{color:`${isScrollingVertical? state.colorObj.accentColor: state.colorObj.highLightAccentColor}` }} className="material-symbols-outlined">
                        view_week
                    </span>
                </div>:null
            }
        </div>
    )
}

function mapStateToProps(state:any) {
    return state;
}


export default  connect(mapStateToProps)(ReaderComponent);