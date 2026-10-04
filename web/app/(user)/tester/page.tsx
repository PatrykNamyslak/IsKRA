import WantToTestForm from "@/app/components/WantToTestForm";

export const metadata = {
    title: 'Chcę zostać testerem',
    description: 'Chciałbyś zostać testerem innowacji? Zapisz się!',
}

export default function PageForm() {
    return (
        <div className="min-h-screen bg-transparent pb-16">
            <WantToTestForm />
        </div>
    )
}
