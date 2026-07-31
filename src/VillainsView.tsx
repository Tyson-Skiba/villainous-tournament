import { useState } from "react"
import villainObjectives from '../data/villains.json'
import { villainSets, displayImage } from "./data"

export function VillainsView() {
  const [expanded, setExpanded] = useState<string[]>([])

  return (
    <div className="villains-view">
      {villainSets.map(set => {
        const open = expanded.includes(set.id)

        return (
          <div className="villain-set" key={set.id} >
            <button
              className="round-title villain-set-header"
              onClick={() =>
                setExpanded(current =>
                  current.includes(set.id)
                    ? current.filter(id => id !== set.id)
                    : [...current, set.id]
                )
              }
            >
              <span>{set.name}</span>
              <span>{open ? '−' : '+'}</span>
            </button>

            {open && (
              <div className="draw-table">
                {set.villains.map(name => {
                  const img = displayImage(name, true)
                  const info = villainObjectives[name]

                  return (
                    <div className="draw-row villain-row" key={name}>
                      <div className="character-cell">
                        {img.local && (
                          <img
                            src={img.local}
                            alt={name}
                            onError={e => {
                              if (img.remote) {
                                e.currentTarget.src = img.remote
                              }
                            }}
                          />
                        )}

                        <div className="character-info">
                          <strong>{name}</strong>
                          <small>{info?.objective}</small>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
