import { getAcademicYears } from "@/actions/enrollment/academic-years";
import { getClasses } from "@/actions/enrollment/classes";
import { PromotionManager } from "./promotion-manager";

export default async function PromotionsPage() {
    const years = await getAcademicYears();
    const classes = await getClasses();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Student Promotions</h2>
                <p className="text-muted-foreground">
                    Move students from one class to another for the next academic year.
                </p>
            </div>
            <PromotionManager years={years} classes={classes} />
        </div>
    );
}
