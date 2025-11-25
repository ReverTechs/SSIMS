import { ForceChangePasswordForm } from "@/components/force-change-password-form";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";


export default function ChangePasswordPage() {
    return (
        // <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        //     <div className="flex w-full max-w-sm flex-col gap-6">
        //         <Link
        //             href="#"
        //             className="flex flex-col items-center gap-2 self-center font-medium"
        //         >
        //             <div className="flex h-20 w-20 items-center justify-center rounded-md bg-primary/10 p-2">
        //                 <img
        //                     src="/images/Coat_of_arms_of_Malawi.svg.png"
        //                     alt="Malawi Coat of Arms"
        //                     className="h-full w-full object-contain"
        //                 />
        //             </div>
        //             <span className="text-xl font-bold">Malawi SSIMS</span>
        //         </Link>
        //         <ForceChangePasswordForm />
        //     </div>
        // </div>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Link
                    href="#"
                    className="flex flex-row items-center gap-3 self-center font-medium"
                >
                    {/* Circular image container */}
                    <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-primary/10 p-1">
                        <img
                            src="/images/Coat_of_arms_of_Malawi.svg.png"
                            alt="Malawi Coat of Arms"
                            className="h-full w-full object-contain rounded-full"
                        />
                    </div>

                    {/* Text next to image */}
                    <span className="text-xl font-bold leading-tight">
                        Malawi SSIMS
                    </span>
                </Link>

                <ForceChangePasswordForm />
            </div>
        </div>
    );
}
