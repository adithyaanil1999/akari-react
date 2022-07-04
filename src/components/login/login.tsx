import React, {  Dispatch,useRef,useEffect,useState, FunctionComponent } from 'react';
import './login.css';
import {backendUrl}  from '../../global';


interface LoginProps {
    verifyTokens: ()=> Promise<void> ;
    isLoginVerified: React.SetStateAction<boolean>;
}

const LoginComponent: FunctionComponent<LoginProps> = (props:LoginProps) => {

    const isMobile = require('is-mobile');
    const md5 = require('md5');

    const loginWrap = useRef<HTMLDivElement>(null);
    const formWrap = useRef<HTMLDivElement>(null);
    const toggleWrap = useRef<HTMLDivElement>(null);
    const toggleSlider = useRef<HTMLDivElement>(null);
    const signUpBtnWrap = useRef<HTMLDivElement>(null);
    const loginBtnWrap = useRef<HTMLDivElement>(null);
    const loginUsername = useRef<HTMLInputElement>(null);
    const loginPassword = useRef<HTMLInputElement>(null);
    const loginErrorMessage = useRef<HTMLSpanElement>(null);

    const signUpUsername = useRef<HTMLInputElement>(null);
    const signUpPassword = useRef<HTMLInputElement>(null);
    const signUpConfirmPassword = useRef<HTMLInputElement>(null);
    const signUpErrorMessage = useRef<HTMLSpanElement>(null);

    // state variables
    let [toggleBtnState,toggleBtnNewState] = useState<React.SetStateAction<string>>("login");
    let [isSigningIn,toggleIsSigningIn] = useState<React.SetStateAction<boolean>>(false);


    function checkLoginWrapAnimationEnd(){ 
        // Check if loginWarpper animation has ended then add change display of child divs (on mobile only)
        if (loginWrap.current) {    
            if(isMobile() == true){
                loginWrap.current.addEventListener('animationend',()=>{
                    setTimeout(() => {
                        if (toggleWrap.current && formWrap.current){
                            formWrap.current.style.display = "flex";
                            toggleWrap.current.style.display = "flex";
                        }
                    }, 100);
                })
            }else{
                if (toggleWrap.current && formWrap.current){
                    formWrap.current.style.display = "flex";
                    toggleWrap.current.style.display = "flex";
                }
            }
            
        }
    };

    //functions to toggle between SignUp and login

    const toggleLogin = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if(toggleBtnState !== "login"){
            toggleBtnNewState("login")

            if(toggleSlider.current && loginBtnWrap.current && signUpBtnWrap.current){
                toggleSlider.current.style.transform = "translate(0%)";
                toggleSlider.current.style.borderTopLeftRadius = "20px";
                toggleSlider.current.style.borderBottomLeftRadius = "20px";
                toggleSlider.current.style.borderTopRightRadius = "0px";
                toggleSlider.current.style.borderBottomRightRadius = "0px";
                loginBtnWrap.current.style.color = "black";
                signUpBtnWrap.current.style.color = "white";
            }
        }
    }

    const toggleSignUp = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if(toggleBtnState !== "signUp"){
            toggleBtnNewState("signUp")
            if(toggleSlider.current && loginBtnWrap.current && signUpBtnWrap.current){
                toggleSlider.current.style.transform = "translate(100%)";
                toggleSlider.current.style.borderTopLeftRadius = "0px";
                toggleSlider.current.style.borderBottomLeftRadius = "0px";
                toggleSlider.current.style.borderTopRightRadius = "20px";
                toggleSlider.current.style.borderBottomRightRadius = "20px";
                loginBtnWrap.current.style.color = "white";
                signUpBtnWrap.current.style.color = "black";
            }
        }
    }

    const handleSignIn = async (event: React.MouseEvent<HTMLButtonElement>) =>{
        event.stopPropagation();
        if(isSigningIn === false){
            toggleIsSigningIn(true);
            if(loginUsername.current && loginPassword.current && loginErrorMessage.current){
                //validation checks

                const username = loginUsername.current.value;
                const password = loginPassword.current.value;

                //check username and password is empty

                if (username.length === 0 || password.length === 0 ){
                    loginErrorMessage.current.innerHTML = "Fields cannot be empty";
                    toggleIsSigningIn(false);
                }else if((username.length < 6 && username.length <= 36) || (password.length < 9 && password.length > 100)){
                    loginErrorMessage.current.innerHTML = "Invalid username and password";
                    toggleIsSigningIn(false);
                }else{
                    loginErrorMessage.current.innerHTML = "";
                    // Login Request
                    try{
                        const response = await fetch(backendUrl+'login',{
                            method: 'POST',
                            headers:{
                                'Content-type': 'application/json'
                            },
                            credentials:'include',
                            body: JSON.stringify({
                                'username': username,
                                'password': md5(password)
                            })
                        })
        
                        if(response.ok){
                            toggleIsSigningIn(false);
                            props.verifyTokens();
                    
                        }else{
                            toggleIsSigningIn(false);
                            loginErrorMessage.current.innerHTML = "User not Found";
                            
                        }
                    }catch(err){
                        toggleIsSigningIn(false);
                        loginErrorMessage.current.innerHTML = "Failed to connect to server";

                    }
                }
            }
        }
    }

    const handleSignUp = async (event: React.MouseEvent<HTMLButtonElement>) =>{
        event.stopPropagation();
        if(isSigningIn === false){
            toggleIsSigningIn(true);
            if(signUpUsername.current && signUpPassword.current && signUpConfirmPassword.current && signUpErrorMessage.current){
                //validation checks

                const username = signUpUsername.current.value;
                const password = signUpPassword.current.value;

                //check username and password is empty

                if (username.length === 0 || password.length === 0 ){
                    signUpErrorMessage.current.innerHTML = "Fields cannot be empty";
                    toggleIsSigningIn(false);
                }else if (!(username.length < 6 || username.length <= 36)){
                    signUpErrorMessage.current.innerHTML = "Username must contain atleast 6 and atmost 36 characters";
                    toggleIsSigningIn(false);
                }else if(/^[A-Za-z0-9_]*$/.test(username) === false){
                    signUpErrorMessage.current.innerHTML = "Username must only contain letters,numbers or underscore";
                    toggleIsSigningIn(false);
                }else if(password.length < 9 || password.length > 100){
                    signUpErrorMessage.current.innerHTML = "Password length must be between 8 and 100";
                    toggleIsSigningIn(false);
                }else{
                    signUpErrorMessage.current.innerHTML = "";
                    // signUp Request

                    try{
                        const response = await fetch(backendUrl+'signUp',{
                            method: 'POST',
                            credentials:'include',
                            headers:{
                                'Content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                'username': username,
                                'password': md5(password)
                            })
                        })
        
                        if(response.ok){
                            toggleIsSigningIn(false);
                            const jsonResponse = await response.json();
                            //handle JWT token storage;
                            props.verifyTokens(); 
                        }else{
                            toggleIsSigningIn(false);
                            const jsonResponse = await response.json();
                            if(jsonResponse.result === "USER_EXISTS"){
                                signUpErrorMessage.current.innerHTML = "Username already exists."
                            }
                        }
                    }catch(err){
                        toggleIsSigningIn(false);
                        signUpErrorMessage.current.innerHTML = "Failed to connect to server";

                    }
                }
            }
        }
    }

    useEffect(() => {
        checkLoginWrapAnimationEnd()
    });

    return (
        <div className="login-wrap">
            <div className="logo-wrap">
                <img src="./static/akari_white_icon.png"/>
                <h1>Akari</h1>
            </div>
            <div ref={loginWrap} className="login-form-wrap">
                <div ref={formWrap} className="form-wrap">
                    <div className={`form-inner-wrap ${toggleBtnState === "login" ?"flex": "none" }`}>
                        <input ref={loginUsername} className='form-input' type="text" placeholder='Username' />
                        <input ref={loginPassword} className='form-input' type="password" placeholder='Password' />
                        <button onClick={handleSignIn} className="form-btn">
                            <span>Login Into Your Account</span>
                            <div className="form-btn-icon-wrap">
                                { isSigningIn ? 
                                    <div className="spinner">
                                        <div className="double-bounce1"></div>
                                        <div className="double-bounce2"></div>
                                    </div>
                                    :
                                    <span className="material-icons">arrow_forward</span>
                                }
                            </div>
                        </button>
                        <span ref={loginErrorMessage} className="form-error-message"></span>
                    </div>
                    <div className={`form-inner-wrap signUp-form ${toggleBtnState !== "login" ?"flex": "none" }`}>
                        <input ref={signUpUsername} className='form-input' type="text" placeholder='Username' />
                        <input ref={signUpPassword} className='form-input' type="password" placeholder='Password' />
                        <input ref={signUpConfirmPassword} className='form-input' type="password" placeholder='Confirm Password' />
                        <button onClick={handleSignUp} className="form-btn">
                            <span>Create Your Account</span>
                            <div className="form-btn-icon-wrap">
                                { isSigningIn ? 
                                    <div className="spinner">
                                        <div className="double-bounce1"></div>
                                        <div className="double-bounce2"></div>
                                    </div>
                                    :
                                    <span className="material-icons">arrow_forward</span>
                                }
                            </div>
                        </button>
                        <span ref={signUpErrorMessage} className="form-error-message"></span>
                    </div>
                </div>
                <div ref={toggleWrap} className="toggle-wrap">
                    <div className="toggle-inner-wrap">
                        <div className="slider-wrap">
                            <div ref={toggleSlider} className="toggle-slider"/>
                        </div>
                        <div ref={loginBtnWrap} onClick={toggleLogin} className="login-btn-wrap">
                            <h3>Login</h3>
                        </div>
                        <div ref={signUpBtnWrap} onClick={toggleSignUp} className="signUp-btn-wrap">
                            <h3>Sign Up</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }
  
  export default LoginComponent;
  