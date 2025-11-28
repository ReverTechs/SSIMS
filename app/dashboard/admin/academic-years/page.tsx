import { getAcademicYears } from "@/actions/academic-years";
import { AcademicYearManager } from "./academic-year-manager";

export default async function AcademicYearsPage() {
    const years = await getAcademicYears();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Academic Settings</h2>
            </div>
            <AcademicYearManager initialYears={years} />
        </div>
    );
}
