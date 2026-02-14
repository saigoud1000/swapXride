import Link from 'next/link'
import { Logo } from '@/components/logo'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Car } from 'lucide-react'
import { NotificationBadge } from '@/components/notification-badge'
export async function Header() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-24 items-center justify-between mx-auto px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo />
                    </Link>
                </div>

                <nav className="flex items-center gap-4">
                    <Button asChild variant="ghost">
                        <Link href="/listings/create">Post a Car</Link>
                    </Button>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/messages">
                                <NotificationBadge />
                            </Link>
                            <form action={signOut}>
                                <Button variant="ghost">Sign Out</Button>
                            </form>
                            <Link href="/profile">
                                <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity">
                                    <AvatarImage src={user.user_metadata?.avatar_url} />
                                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
