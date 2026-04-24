'use client'

import Button from "@/components/ui/Button";
import {useAuth} from "@/lib/auth";

export default function ChatPage() {
    const {logout} = useAuth();

    function onClick(){
        logout();
    }
    return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
            <Button type="submit" onClick={onClick} className="mt-2">
                Logout
            </Button>
            <p className="text-white/50">Chat coming in Part 4...</p>
        </div>
    );
}