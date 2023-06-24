import { useEffect, useState } from 'react';
import supabase from '../../../supabase';
import { User as MyUser } from '../../../types/userTypes'; // Import custom User type with alias
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Dashboard/Sidebar/Sidebar';
import userIcon from '../../../assets/icons/user.png';
import ShortenLink from '../../../components/Modals/ShortenLinkModal';
import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import LogoutModal from '../../../components/Modals/LogoutModal';
import '../../../App.css'
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<MyUser | null>(null); // Use the custom User type

  // redirect to login if not logged in
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        navigate('/login')
      }
    })();
  }, [navigate])

  // fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const session = await supabase.auth.getSession();
      const currentUser = session?.data?.session?.user;

      if (currentUser) {
        setUser(currentUser as MyUser); // Cast currentUser to MyUser type
      } else {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className='flex font-circular'>
      <Sidebar />
      <section className='sm:ml-[25%] lg:ml-[20%] w-full'>
        {/* topbar */}
        <div className='bg-white fixed right-0 z-10 border-b border-gray-200 py-4 px-6 flex items-center justify-between w-full sm:w-3/4 lg:w-4/5 '>
          <div>
            <h1 className="sm:hidden text-blue-600 text-3xl font-medium tracking-tighter whitespace-nowrap ">btchr <span className="text-blue-900 text-3xl leading-none -ml-2.5">.</span></h1>
            <h1 className='hidden sm:flex text-gray-800 font-semibold tracking-tight text-lg'>Dashboard</h1>
          </div>
          <div className='flex items-center space-x-4 sm:mr-6'>
            {/* <button className='h-fit w-fit whitespace-nowrap sm:w-full rounded-lg px-4 py-3 bg-blue-700 text-white shadow-gray-300/20 shadow-inner' type="submit">Shorten new link</button> */}
            <ShortenLink />
            {/* <div className='flex items-center w-full space-x-1'>
              <img className='w-8 h-8' src={userIcon} alt="" />
              <div className='hidden sm:flex flex-col w-fit -space-y-1'>
                <span className='text-gray-700'>cybergenie</span>
                <span className='text-sm text-gray-500'>{user?.email}</span>
              </div>
            </div> */}
            <div className="text- text-gray-700">
              <Popover className="relative">
                {() => (
                  <>
                    <Popover.Button>
                      <div className='sm:hover:cursor-default focus:outline-none flex items-center text-left w-full space-x-2'>
                        <img className='w-8 h-8' src={userIcon} alt="" />
                        <div className='hidden sm:flex flex-col w-fit -space-y-1'>
                          <span className='text-gray-700'>cybergenie</span>
                          <span className='text-sm text-gray-500'>{user?.email}</span>
                        </div>
                      </div>
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="sm:hidden right-0 absolute z-10 mt-3 w-fit">
                        <div className="overflow-hidden rounded-lg shadow-lg">
                          <div className="w-fit relative bg-white p-1">
                            <LogoutModal />
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>
          </div>
        </div>
        <main >
          <Outlet />
        </main>
        {/* main content */}

      </section>
    </div>
  );
};

export default Dashboard;
