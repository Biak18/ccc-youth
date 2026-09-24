import type { YouthLeader } from '../types/db'

export default function LeaderCard({ leader }: { leader: YouthLeader }) {
  return (
    <div className="text-center">
      {leader.photoUrl ? (
        <img
          src={leader.photoUrl}
          alt={leader.name}
          loading="lazy"
          className="mx-auto h-28 w-28 rounded-full object-cover ring-4 ring-surface"
        />
      ) : (
        <div
          aria-hidden="true"
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-navy to-skyblue text-2xl font-bold text-white ring-4 ring-surface"
        >
          {leader.name.charAt(0)}
        </div>
      )}
      <h3 className="mt-4 font-bold text-heading">{leader.name}</h3>
      {leader.roleTitle && <p className="text-sm text-muted">{leader.roleTitle}</p>}
    </div>
  )
}
