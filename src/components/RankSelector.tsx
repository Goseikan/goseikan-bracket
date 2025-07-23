import React from 'react'
import { KendoRank } from '../types'
import { GROUPED_RANKS, getRankBadgeClass } from '../utils/kendoRanks'

/**
 * RankSelector component for selecting kendo ranks
 * Groups ranks by category (Mudansha, Kyu, Dan) for better UX
 */

interface RankSelectorProps {
  value: KendoRank
  onChange: (rank: KendoRank) => void
  error?: string
  disabled?: boolean
  label?: string
  required?: boolean
}

const RankSelector: React.FC<RankSelectorProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = "Kendo Rank",
  required = false
}) => {
  return (
    <div className="input-field">
      {/* Label */}
      <label className="block text-label-large font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Select dropdown */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as KendoRank)}
        disabled={disabled}
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        required={required}
      >
        <option value="">Select your rank</option>
        
        {/* Mudansha group */}
        <optgroup label="No Formal Rank">
          {GROUPED_RANKS.mudansha.map((rank) => (
            <option key={rank} value={rank}>
              {rank}
            </option>
          ))}
        </optgroup>
        
        {/* Kyu ranks group */}
        <optgroup label="Kyu Ranks (Beginner to Intermediate)">
          {GROUPED_RANKS.kyu.map((rank) => (
            <option key={rank} value={rank}>
              {rank}
            </option>
          ))}
        </optgroup>
        
        {/* Dan ranks group */}
        <optgroup label="Dan Ranks (Advanced)">
          {GROUPED_RANKS.dan.map((rank) => (
            <option key={rank} value={rank}>
              {rank}
            </option>
          ))}
        </optgroup>
      </select>
      
      {/* Current selection preview */}
      {value && (
        <div className="mt-2">
          <span className="text-label-medium text-gray-600 mr-2">Selected:</span>
          <span className={getRankBadgeClass(value)}>
            {value}
          </span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p className="mt-2 text-body-small text-red-600">{error}</p>
      )}
      
      {/* Help text */}
      <p className="mt-2 text-body-small text-gray-500">
        Select your current kendo rank. If you don't have a formal rank, choose "Mudansha".
      </p>
    </div>
  )
}

export default RankSelector