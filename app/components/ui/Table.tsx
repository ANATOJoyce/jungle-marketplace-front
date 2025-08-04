import React from 'react';

interface TableProps {
  headers: { key: string; label: string }[];
  data: Record<string, any>[];
  renderCell?: (key: string, value: any, row: any) => React.ReactNode;
  className?: string;
}

export const Table = ({ headers, data, renderCell, className = '' }: TableProps) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header) => (
            <th
              key={header.key}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, i) => (
          <tr key={i}>
            {headers.map((header) => (
              <td key={`${i}-${header.key}`} className="px-6 py-4 whitespace-nowrap">
                {renderCell
                  ? renderCell(header.key, row[header.key], row)
                  : row[header.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);