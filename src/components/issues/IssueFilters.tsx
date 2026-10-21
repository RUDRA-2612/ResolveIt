import { Filter } from 'lucide-react';
import { ISSUE_DATA } from '../../taxonomy';

interface IssueFiltersProps {
    selectedDepartment: string;
    onSelectDepartment: (dept: string) => void;
}

export function IssueFilters({
    selectedDepartment,
    onSelectDepartment,
}: IssueFiltersProps) {
    const departments = ['All Departments', ...Object.keys(ISSUE_DATA)];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-20">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter size={14} className="text-teal-500" /> Filter by Dept.
            </h3>
            <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1.5">
                {departments.map((dept) => (
                    <button
                        key={dept}
                        onClick={() => onSelectDepartment(dept)}
                        className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 shrink-0 ${selectedDepartment === dept
                                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'
                            }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full shrink-0 ${selectedDepartment === dept
                                    ? 'bg-white'
                                    : dept === 'All Departments'
                                        ? 'bg-slate-400'
                                        : dept.includes('Hostel')
                                            ? 'bg-teal-400'
                                            : dept.includes('Infrastructure')
                                                ? 'bg-blue-400'
                                                : dept.includes('Academics')
                                                    ? 'bg-violet-400'
                                                    : dept.includes('Sports') || dept.includes('Student Life')
                                                        ? 'bg-amber-400'
                                                        : dept.includes('Health')
                                                            ? 'bg-rose-400'
                                                            : 'bg-emerald-400'
                                }`}
                        ></span>
                        <span className="truncate">{dept}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}