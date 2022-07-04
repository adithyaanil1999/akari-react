
import React, { useEffect, useState,useRef } from 'react';
import './App.css';
import { store } from './index';
import { connect } from 'react-redux';
import { Routes, Route, useNavigate,useLocation, createSearchParams } from "react-router-dom";
import {backendUrl,scaperUrl}  from './global';
import LoginComponent from './components/login/login';
import HomeComponent from './components/home/home';
import BookmarkComponent from './components/bookmarks/bookmarks';
import DashboardComponent from './components/dashboard/dashboard';
import SettingsComponent from './components/settings/settings';
import HistoryComponent from './components/history/history';
import GenreComponent from './components/genre/genre';
import AboutMangaComponent from './components/aboutManga/aboutManga';
import ReaderComponent from './components/reader/reader';
import { action_add_src_object,action_current_src } from './reducers/actions';
import isMobile from 'is-mobile';


function App() {
  let [isLoggedIn,toggleIsLoggedIn] = useState<React.SetStateAction<boolean>>(false);
  let [isVerifyingLogin,toggleVerifyingLogin] = useState<React.SetStateAction<boolean>>(true);
  let [isLoginVerified,toggleLoginVerify] = useState<React.SetStateAction<boolean>>(false);
  let [isSrcSet,toggleIsSrcSet] = useState<React.SetStateAction<boolean>>(false);
  let [isSrcObjectLoaded,toggleSrcObjectLoaded] = useState<React.SetStateAction<boolean>>(false);
  let [isVerificationLoopSet,toggleVerificationLoop] = useState<React.SetStateAction<boolean>>(false);
  


  let [bgColor, setBgColor] = useState<React.SetStateAction<string>>('#21343e');
  let [secondaryBgColor, setSecondaryBgColor] = useState<React.SetStateAction<string>>('#2f444d');
  let [highLightBgColor, setHighlightBgColor] = useState<React.SetStateAction<string>>('#32606a');
  let [accentColor, setAccentColor] = useState<React.SetStateAction<string>>('#6dc7ae');
  let [highLightAccentColor, sethightLightAccentColor] = useState<React.SetStateAction<string>>('#54fff7');

  let [aboutMangaUrl,setAboutMangaUrl] = useState<React.SetStateAction<string>>('');

  let colorObj = {
      bgColor: bgColor,
      secondaryBgColor: secondaryBgColor,
      highLightBgColor: highLightBgColor,
      accentColor: accentColor,
      highLightAccentColor: highLightAccentColor
  }

  const navigate = useNavigate();
  let location = useLocation();
  const fullScreenLoader = useRef<HTMLDivElement>(null);


  const openAboutPage = (url:string) => {
    // opens about manga page with url from child components
    if(url.length !== 0){

      const params = createSearchParams({
        link: encodeURIComponent(url)
      }).toString()
      
      url = 'home/manga?' + params
      navigate(url,{state:{colorObj: colorObj}})
    }

  }

  const getSrc = async() =>{
    const resp = await fetch(backendUrl+'getSrc',{
      method: 'POST',
      credentials: 'include'
    })
    if(resp.ok){
      const jsonResponse = await resp.json();
      store.dispatch(action_current_src(jsonResponse.result.src))
      const srcObjResponse = await getSrcObject();
      if(srcObjResponse){
        toggleSrcObjectLoaded(true)
        store.dispatch(action_add_src_object(srcObjResponse));
      }
    }else{
      console.log("ERROR_SETTING_SRC")
    }
  }

  const getSrcObject = async() =>{
    const resp = await fetch(scaperUrl+'sourceList',{
      method: 'GET',
    })
    if(resp.ok){
      const jsonResponse = await resp.json();
      return jsonResponse
     
    }else{
      console.log("ERROR_SETTING_SRC_OBJECT")
    }
  }

  const verifyTokens = async() =>{
    if(isLoginVerified === false){
        toggleVerifyingLogin(true);
    }
    try {
        const resp = await fetch(backendUrl+'verifyToken',{
            method: 'GET',
            credentials: 'include'
        })
        if(resp){
            const jsonResponse = await resp.json();
            if(jsonResponse){
                toggleVerifyingLogin(false);
                toggleLoginVerify(true)
            }
            let jsonResponseResult = jsonResponse.result;
            if(jsonResponseResult === "REFRESH_TOKEN_INVALID"){
                //logout
                toggleVerifyingLogin(false);
                toggleIsLoggedIn(false)
            }else if(jsonResponseResult === "ACCESS_TOKEN_REFRESH"){
                console.log("Silent Refresh")
                toggleVerifyingLogin(false);
            }else if(jsonResponseResult === "NO_TOKENS_FOUND"){
                toggleIsLoggedIn(false)
            }else if(jsonResponseResult ==="USERNAME_FOUND"){
                // login logic
                document.cookie =  `username=${jsonResponse.username}`;
                toggleIsLoggedIn(true)
            }
        }
    } catch (error) {
        console.log(error);
        toggleLoginVerify(true)
        toggleVerifyingLogin(false);
    }
  }

  useEffect(()=>{

    if(isLoginVerified === false){
      verifyTokens();
    }else{
      if(isLoggedIn === true){
        if(isSrcSet === false){
          getSrc();
          toggleIsSrcSet(true);
        }else{
          if(!location.pathname.includes('/home')){
            navigate("/home/dashboard", { replace: true });
            // togglePreventNavigation(true)
          }
        }
      }else{
        if(location.pathname !== '/'){
          navigate("/", { replace: true });
        }
      }
      //verify tokens every 10 mins
      if(isVerificationLoopSet === false){
        setInterval(()=>verifyTokens(),600000);
        toggleVerificationLoop(true);
      }
    }
  })
  return (
    <div className="App scroll-fix">
      {
        isMobile()?null:
        <div className="showUnderDev">
        <img src="https://www.fas10.in/wp-content/uploads/2021/04/underdevelpoment.png" alt="" />
        </div>

      }
      { isVerifyingLogin && isSrcObjectLoaded ?
          <div ref={fullScreenLoader} style={{background:String(bgColor)}} className="full-screen-loading">
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
        : null
      }
      <Routes>
        
        { 
          isLoggedIn === false? 
            <Route path="/" element={<LoginComponent isLoginVerified={isLoginVerified} verifyTokens ={ verifyTokens} />} />
          :
            <Route path="/home/*" element={<HomeComponent getColors={colorObj} isLoginVerified={isLoginVerified} verifyTokens ={ verifyTokens} />}>
              <Route path="bookmarks" element={<BookmarkComponent  openAboutPage={openAboutPage} getColors={colorObj}/>}/>
              <Route path="genre" element={<GenreComponent openAboutPage={openAboutPage} getColors={colorObj}/>}/>
              <Route path="dashboard" element={<DashboardComponent openAboutPage={openAboutPage} getColors={colorObj}/>}/>
              <Route path="settings" element={<SettingsComponent getColors={colorObj} verifyTokens ={verifyTokens}/>}/>
              <Route path="history" element={<HistoryComponent openAboutPage={openAboutPage} getColors={colorObj}/>}/>
              <Route path="manga" element={<AboutMangaComponent/>}/>
              <Route path="manga/read" element={<ReaderComponent/>}/>
            </Route>
        }
        
      </Routes>
    </div>
  );
}

function mapStateToProps(state:any) {
  return state;
}


export default connect(mapStateToProps)(App);
