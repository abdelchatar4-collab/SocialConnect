import AbsenceForm from '@/features/conges/components/AbsenceForm';

export default function CongesPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-slate-800 mb-2">Gestion des Absences</h1>
                <p className="text-slate-500">
                    Signalez vos congés, maladies ou autres absences pour tenir l'équipe informée.
                </p>
            </div>

            <AbsenceForm />
        </div>
    );
}
