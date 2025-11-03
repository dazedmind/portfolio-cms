import agfxLogo from '../assets/agfx-logo.png'
import ThemeToggle from '@/component/ThemeToggle'

export default function NavBar() {  
    return (
        <div className='w-full p-4 px-10 flex items-center justify-between bg-background text-primary'>
            <span className='flex items-center gap-4'>
                <img src={agfxLogo} alt="Agfx logo" className='w-12 h-12' />
                <p className='text-2xl font-medium'>Portfolio CMS</p>
            </span>
            
            <span>
                <ThemeToggle />
            </span>
        </div>
    )
    }