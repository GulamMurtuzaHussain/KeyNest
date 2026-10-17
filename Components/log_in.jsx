
import React, { useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

const LoginPage = () => {
    const navigate = useNavigate();
    const nameRef = useRef();
    const mailRef = useRef();
    const passRef = useRef();

    const HandleLogin = async (e) => {
        e.preventDefault();

        let response;
        try {
            let findUser = await fetch('http://localhost:3000/find_user', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: nameRef.current.value, 
                    password: passRef.current.value 
                }),
                credentials: "include"
            });

            response = await findUser.json();

            if (!findUser.ok) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
        }
        catch (err) {
            toast.error('server error');
        }





        const userData = {
            username: nameRef.current.value,
            email: response.email
        };

        navigate('/', { state: userData });
    }

    return (
        <><Toaster />

            <div>
                <img src="/dark.jpg" alt="" className='absolute -z-10 w-screen h-screen object-center' />
            </div>

            <div className='flex justify-center items-center h-screen '>

                {/* HERE WE USED FORM AND REMOVED LINK TO FOR VALIDATION */}
                <form onSubmit={HandleLogin}>

                    <div className='backdrop-blur-xs border border-white/30 shadow-2xl text-[rgb(220,215,215)] rounded-2xl w-[30vw] h-[60vh] flex flex-col justify-center'>

                        <div className='gow-text text-3xl text-center'>Welcome Back!</div>

                        <div className='font-sans text-[18px] text-center'>Log in to continue secured savings.</div>

                        <div className='mt-3 ml-5'>

                            <div className='flex flex-col'>
                                <label htmlFor="username">Enter Your Username:</label>
                                <input required={true} ref={nameRef} type="text" name="username" className='mt-2 border border-white/30 rounded-2xl w-[28vw] h-[5vh]' />
                            </div>

                            <div className='mt-2 flex flex-col'>
                                <label htmlFor="password">Enter Your Password:</label>
                                <input required={true} ref={passRef} type="password" name="password" className='mt-2 border border-white/30 rounded-2xl w-[28vw] h-[5vh]' />
                                <h4 className='text-[12px] mt-2'>Note: Do not use real password. Create one just for this site.</h4>
                            </div>

                        </div>

                        <button className='font-semibold mt-10 text-xl border border-white/30 rounded-2xl w-[7vw] h-[8vh] mx-auto flex justify-center items-center' type='submit'>Log In</button>

                    </div>

                </form>

            </div>
            
            </>
    )
}

export default LoginPage;



