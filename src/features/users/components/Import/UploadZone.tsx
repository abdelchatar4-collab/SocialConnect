import React from 'react';

interface UploadZoneProps {
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    filesToProcess: File[];
    onClearFiles: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
    onFileUpload,
    isLoading,
    filesToProcess,
    onClearFiles
}) => {
    return (
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm">1</span>
                Sélectionnez vos fichiers
            </h3>

            <div className="mt-4 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/10 transition-all group">
                <input
                    type="file"
                    id="file-upload"
                    accept=".xlsx,.xls,.csv"
                    multiple
                    onChange={onFileUpload}
                    disabled={isLoading}
                    className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="p-5 bg-blue-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <span className="text-blue-600 text-lg font-bold hover:underline mb-2">Charger des fichiers ou dossiers</span>
                    <span className="text-sm text-gray-400 italic">Vous pouvez sélectionner plusieurs fichiers Excel ou CSV</span>
                </label>
            </div>

            {filesToProcess.length > 0 && (
                <div className="mt-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-700">{filesToProcess.length} fichier(s) prêt(s)</h4>
                        <button
                            onClick={onClearFiles}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Tout effacer
                        </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filesToProcess.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-green-600 font-bold text-[10px]">XLS</div>
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(0)} KB</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 flex items-start gap-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-100">
                <div className="p-1 bg-blue-100 rounded text-blue-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <p><strong>Note :</strong> Faites votre mapping sur le premier fichier. Il sera automatiquement appliqué à tout le lot.</p>
            </div>
        </div>
    );
};
