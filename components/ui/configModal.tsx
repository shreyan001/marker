import React from "react";

interface ConfigModalProps {
    isOpen: boolean;
    slippageAmount: string;
    deadlineMinutes: string;
    onSlippageChange: (value: string) => void;
    onDeadlineChange: (value: string) => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ 
    isOpen, 
    slippageAmount, 
    deadlineMinutes, 
    onSlippageChange, 
    onDeadlineChange 
}) => {
    if (!isOpen) return null;



    return (
        <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-black shadow-lg rounded-lg p-4 z-10">
            <h4 className="text-lg font-bold mb-4">Transaction Settings</h4>
            <div className="mb-4">
                <label className="block text-gray-600 mb-2">Slippage Tolerance</label>
                <div className="flex items-center">
                    <input
                        className="bg-white border-2 border-black text-lg w-full pl-3 pr-10 py-2 rounded-lg shadow-[inset_0_4px_6px_rgba(0,0,0,0.1)] focus:shadow-[inset_0_6px_8px_rgba(0,0,0,0.2)] transition-all duration-200"
                        placeholder="1.0%"
                        value={slippageAmount}
                        onChange={e => onSlippageChange(e.target.value)}
                    />
                    <span className="ml-2 text-gray-600">%</span>
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-gray-600 mb-2">Transaction Deadline</label>
                <div className="flex items-center">
                    <input
                        className="bg-white border-2 border-black text-lg w-full pl-3 pr-10 py-2 rounded-lg shadow-[inset_0_4px_6px_rgba(0,0,0,0.1)] focus:shadow-[inset_0_6px_8px_rgba(0,0,0,0.2)] transition-all duration-200"
                        placeholder="10"
                        value={deadlineMinutes}
                        onChange={e => onDeadlineChange(e.target.value)}
                    />
                    <span className="ml-2 text-gray-600">minutes</span>
                </div>
            </div>
        </div>
    )
}

export default ConfigModal;
