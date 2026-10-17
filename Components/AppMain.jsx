import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import SigninPage from './components/sign_in';
import LoginPage from './components/log_in';
import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
// import './App.css'
import toast, { Toaster } from 'react-hot-toast'
import { Navigate } from 'react-router-dom';

/*


TEST ALL THE ATTACKS: GO TO GPT> KeyNest Full Stack Review. AND TEST ALL OF THEM

*/











function Home() {
  let iconRef = useRef();
  let webRef = useRef();
  let userRef = useRef();
  let passRef = useRef();
  const [passwords, setPasswords] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem("passwords");
    if (saved) setPasswords(JSON.parse(saved));
  }, []);


  useEffect(() => {
    localStorage.setItem("passwords", JSON.stringify(passwords));
  }, [passwords])




  const [showPassword, setshowPassword] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate()

  const ShowPassword = (id) => {
    setPasswords(
      passwords.map(passes => {
        if (passes.id === id) return { ...passes, show: !passes.show }
        return passes;
      })
    )
  }


  const ShowData = async () => {
    console.log("website:" + webRef.current.value)
    console.log("user:" + userRef.current.value)
    console.log("pass:" + passRef.current.value)
    
    if (!loggedIn) {
      toast.error("Login to save the data");
      return
    }

    // SAVING PASSWORD  
    if (webRef.current.value && userRef.current.value && passRef.current.value) {
        let savePassword = await fetch("http://localhost:3000/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            site: webRef.current.value,
            username: userRef.current.value,
            password: passRef.current.value
          }),
          credentials: "include"
        })

      if (savePassword.ok) {
        toast.success("SAVED TO DATABASE");
      }
      setPasswords(prev => [...prev,
      {
        id: Math.random(),
        sitename: webRef.current.value,
        username: userRef.current.value,
        password: passRef.current.value,
        show: false
      }
      ])
    }
  }



  const EditDetails = () => {
    webRef.current.value = document.getElementById('123_site').innerHTML;
    userRef.current.value = document.getElementById('123_user').innerHTML;
    passRef.current.value = document.getElementsByClassName('password').innerText;
  }

  const DeleteRecord = async (id) => {
    let del = await fetch("http://localhost:3000/delete_record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id }),
      credentials: "include"
    });
    let res = await del.json();
    if (del.ok) {
      toast.success(res.message);
    }
    setPasswords(pass => pass.filter(pass => pass.id !== id));
  }

  const location = useLocation();
  const data = location.state;

  // RETRIEVE PASSWORDS
  useEffect(() => {
    if (!data) console.log("NO DATA");
    else {
      async function fetchData() {

        let retrieve_passwords = await fetch("http://localhost:3000/retrieve_data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
          credentials: "include"
        });

        let retrieved_passwords = await retrieve_passwords.json();
        console.log(retrieved_passwords.length);
        if (retrieved_passwords.length > 0) {
        retrieved_passwords.map(passwords => {
          setPasswords(prev => ([...prev, {
            id: passwords._id.toString(),
            sitename: passwords.site,
            username: passwords.username,
            password: passwords.password,
            show: false,
          }]))
        })

        const formatted = retrieved_passwords.map(passwords => ({
          id: (passwords._id ? passwords._id.toString() : Math.random()),
          sitename: passwords.site,
          username: passwords.username,
          password: passwords.password,
          show: false
        }
          // console.log(passwords.site, passwords.username, passwords.password)
        ));


        setPasswords(formatted);
        // console.log("RETRIEVED PASS: ", retrieved_passwords);
        // console.log("FORMATTED : ", formatted);
        }
      }

      fetchData()
      // console.log(data.username);
      // console.log(data.email);
      setLoggedIn(true);
    }
  }, [data])


  // CHECK AUTH
  useEffect(() => {
    fetch("http://localhost:3000/check_auth",{
      credentials: "include"
    }).
    then(res =>{
      if(!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      setLoggedIn(true);
    })
    .catch(()=>{
      setLoggedIn(false);
    });
  },[]);





  useEffect(() => {
    if (loggedIn) toast.success("Welcome");
  }, [loggedIn])


  // HANDLE LOGOUT
  const HandleLogOut = async () => {

    let logout = await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include"
    })

    logout = await logout.json();
    setPasswords([]);
    webRef.current.value = '';
    userRef.current.value = '';
    passRef.current.value = '';
    setLoggedIn(false);
    navigate('/', { replace: true });
    toast(logout.message);
  }

  return (
    <>
      {/* {(window.innerWidth < 450) && console.log("HELLO")} */}
      
      {/* NAVBAR */}
      
      <Toaster />
      
      {/* BG IMAGE */}
      <div>
        <img src={(window.innerWidth <= 450) ? "/dark2.png" : "/dark.jpg"} alt="" className='absolute -z-10 w-screen h-screen object-cover' />
      </div>

      {/* NAVI BAR */}
      <div className='nav gow-text backdrop-blur-xs border border-white/30 shadow-2xl w-[70vw] min-h-[8vh] text-[rgb(220,215,215)] flex justify-around items-center text-[20px] mx-auto rounded-2xl max-sm:w-screen max-sm:text-[15px] '>
        <div className='border-2 border-white/30 rounded-2xl p-2'>KeyNest • Zero-Leak Vault</div>
        <div className='border-2 border-white/30 rounded-2xl flex gap-7.5 p-2'>
          <div className={loggedIn ? 'hidden' : 'visible'}><Link to='/signin'><button className='hover:text-[22px] transition-all ease-in'>Sign In</button></Link></div>
          <div className={loggedIn ? 'hidden' : 'visible'}><Link to='/login'><button className='hover:text-[22px] transition-all ease-in'>Log In</button></Link></div>
          <div className={(loggedIn ? 'visible' : 'hidden') + ' font-normal text-[14px] flex gap-10 items-center justify-center'}  >
            <div className='font-sans'>
              <div>{loggedIn && data.username}</div>
              <div>{loggedIn && data.email}</div>
            </div>
            <div className={loggedIn ? 'visible' : 'hidden'}><button className='hover:text-[22px] text-[20px] font-bold transition-all ease-in' onClick={() => { HandleLogOut() }}>Log Out</button></div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className='flex flex-col items-center gap-5 text-[rgb(220,215,215)] rounded-2xl'>

        {/* FIRST CONTAINER */}
        <div className='backdrop-blur-xs border border-white/30 shadow-2xl w-[70vw] h-[31vh] mt-7.5 rounded-2xl max-sm:w-[90vw]'>

          <div className='text-3xl text-center gow-text mt-1 max-sm:text-[19px] max-sm:mt-6'>One Nest for All Your Keys.</div>

          <div className='flex flex-col gap-2 justify-center rounded-2xl max-sm:gap-0'>
            {/* SITE NAME INPUT */}
            <div className='p-3 mt-1 '><input ref={webRef} type="text" name="website_name" placeholder='Enter the website name:' className='border-white/30 border font-sans font-medium h-[6vh] w-full pl-1 rounded-2xl max-sm:h-[4vh] max-sm:pl-2' /></div>

            {/* USERNAME AND PASSWORD INPUT */}
            <div className='flex text-[15px] font-sans font-medium w-[70vw] gap-5 px-2 max-sm:flex-col max-sm:gap-3'>

              <div><input ref={userRef} type="text" name="website_mail" placeholder='Enter the username/email:' className='rounded-2xl h-[6vh] border-white/30 border w-[45vw] pl-1 max-sm:h-[4vh] max-sm:w-[85vw] max-sm:pl-2' /></div>
              <div><input ref={passRef} type="password" name="website_password" placeholder='Enter the password:' className='rounded-2xl h-[6vh] border-white/30 border w-[20vw] pl-1 max-sm:h-[4vh] max-sm:w-[85vw] max-sm:pl-2' onKeyDown={(e) => { if (e.key == 'Enter') ShowData() }} /></div>

            </div>

            {/* SAVE BUTTON */}
            <div className='mt-2'>
              <button ref={iconRef} className='w-[25vw] h-[5vh] font-sans font-medium text-xl flex items-center justify-center gap-2 rounded-2xl  border border-white/30 mx-auto max-sm:mt-5 max-sm:border-[#ffc60a] ' onClick={() => ShowData()}>
                <lord-icon
                  src="./save.json"
                  trigger="hover"
                  target='button'
                  colors="primary:#DCD7D7"
                  style={{ width: "30px", height: "30px" }}
                ></lord-icon>
                <div className='text-center'>Save</div>
              </button>
            </div>

          </div>

        </div>

        {/* SECOND CONTAINER */}
        <div className='backdrop-blur-xs border border-white/30 shadow-2xl text-[rgb(220,215,215)] w-[70vw] h-fit rounded-2xl max-sm:w-[90vw]'>
          <h2 className='ml-3 text-xl font-bold'>Saved Passwords:</h2>
          {passwords.length === 0 ? <div className='ml-3'>No Passwords Saved.</div> : <div className=''>
            
            {/* TABLE */}
            {(window.innerWidth > 450) && <table className='w-[70vw] text-center table-auto'>
              <thead className=''>
                <tr>
                  <th>Site Name:</th>
                  <th>Username/Email:</th>
                  <th>Password:</th>
                  <th>Actions:</th>
                </tr>
              </thead>
              <tbody>
                
                {/* /* <tr className=''>
                <td>Google</td>
                <td>Google</td>
                <td>Google</td>
              </tr>

              {/* <tr className=''>
                <td>{passwords[0].sitename}</td>
                <td>{passwords[0].username}</td>
                <td>{passwords[0].password}</td>
              </tr>

              <tr >
                <td id='123'><input type="text" name="" value={passwords[0].sitename} className='text-center' /></td>
                <td><input type="text" name="" value={passwords[0].username} className='text-center' id='123' readOnly onClick={(e)=>console.log(e.target.id)}/></td>
                <td><input className='text-center' type="password" name="" value={passwords[0].password} /></td>
              </tr>  */}

                {passwords.map((items) => {
                  return <tr key={items.id} >
                    {/* SITE NAME */}
                    <td className='text-center w-[15vw]'>

                      <div className='flex justify-center items-center gap-0 text-center'>
                        {/* <input type="text" name="" value={items.sitename} className='text-center' /> */}
                        <span id='123_site'>{items.sitename}</span>

                      </div>
                    </td>

                    {/* USERNAME */}
                    <td>
                      <div className='flex justify-center text-center items-center'>
                        <span id='123_user'>{items.username}</span>


                      </div>
                    </td>

                    {/* PASSWORD */}
                    <td>
                      <div className='flex justify-center items-center text-center gap-0'>
                        <span id={items.id} className='password'>{items.show ? items.password : "•".repeat(items.password.length)}</span>
                       
                        <button className='flex justify-center items-center' onClick={() => ShowPassword(items.id)}>
                          <lord-icon
                            src="./eyes.json"
                            trigger="hover"
                            target="button"
                            colors="primary:#DCD7D7,secondary:#DCD7D7"
                            style={{ width: "5vw", height: "5vh" }}
                          ></lord-icon>
                        </button>

                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className='flex justify-center items-center'>

                        <button className="flex items-center" onClick={() => EditDetails()}>
                          <lord-icon
                            src="./edit.json"
                            trigger="hover"
                            target="button"
                            colors="primary:#DCD7D7,secondary:#DCD7D7"
                            style={{ width: "5vw", height: "3.5vh" }}
                          ></lord-icon>
                        </button>

                        <button onClick={() => DeleteRecord(items.id)}>
                          <lord-icon
                            src="./delete.json"
                            trigger="hover"
                            target="button"
                            colors="primary:#DCD7D7"
                            style={{ width: "3vw", height: "3vh" }}
                          ></lord-icon>
                        </button>

                      </div>
                    </td>

                    {/* <td><input type="text" name="" value={items.username} className='text-center' id='123' readOnly onClick={(e) => console.log(e.target.id)} /></td>
                    <td><input className='text-center' type="password" name="" value={items.password} /></td> */}
                  </tr>
                })}
              </tbody>

            </table>}


            {(window.innerWidth <= 450) &&
              passwords.map((items) => {
                return <>

                  <div key={items.id} className='ml-5 mt-2 text-[17px] font-bold border border-white/30 w-[80vw] p-2 h-fit mb-3 rounded-2xl'>
                    <div id='123_site'>Site: {items.sitename}</div>
                    <div className='mt-2' id='123_user'>Username: {items.username}</div>
                    <div className='flex items-center gap-4'>Password:
                      <span id={items.id} className='password'>{items.show ? items.password : "•".repeat(items.password.length)}</span>
                     
                      <button className='flex justify-center items-center' onClick={() => ShowPassword(items.id)}>
                        <lord-icon
                          src="./eyes.json"
                          trigger="hover"
                          target="button"
                          colors="primary:#DCD7D7,secondary:#DCD7D7"
                          style={{ width: "8vw", height: "5vh" }}
                        ></lord-icon>
                      </button>

                    </div>

                    <div className='flex items-center gap-4'>
                      <div className='flex justify-center items-center gap-5'>
                        
                        <button className="flex items-center" onClick={() => EditDetails()}>
                          <lord-icon
                            src="./edit.json"
                            trigger="hover"
                            target="button"
                            colors="primary:#DCD7D7,secondary:#DCD7D7"
                            style={{ width: "8vw", height: "3.5vh" }}
                          ></lord-icon>
                        </button>

                        <button onClick={() => DeleteRecord(items.id)}>
                          <lord-icon
                            src="./delete.json"
                            trigger="hover"
                            target="button"
                            colors="primary:#DCD7D7"
                            style={{ width: "6vw", height: "3vh" }}
                          ></lord-icon>
                        </button>

                      </div>
                    </div>

                  </div>
                </>
              })
            }

          </div>}
        </div>

      </div>
    </>
  )
}


function App() {
  // BrowserRouter wraps the entire app and enables routing by listening to URL changes and providing routing context to all components.
  // Routes checks the current URL and decides which Route matches.
  // Route maps a specific URL path to a component (example: "/home" → Home component).
  // <Link> is used for clickable navigation between routes.
  // useNavigate() is used for programmatic navigation (example: after successful login).
  // Navigation is always done using URL paths (like "/home"), never file paths (like components/Home.jsx).
  // Flow: BrowserRouter enables routing → Routes matches URL → matching Route renders component → component appears on screen.
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signin' element={<SigninPage />} />
      <Route path='/' element={<Home />} />
    </Routes>
  )
}

export default App;