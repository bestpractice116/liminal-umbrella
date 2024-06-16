import { useQuery } from '@tanstack/react-query'

function fetchBotActivityList() {
  return fetch('/api/botplaying').then(data => data.json());
}

export default function AdminBotPlaying() {
  const result = useQuery({ queryKey: ['bot_playing'], queryFn: fetchBotActivityList });
  if (result.isLoading) {
    return <div>Loading...</div>;
  }
  if (result.isError) {
    return <div>Error: {result.error.toString()}</div>;
  }
  return <ul>{result.data.playing.map((res: any) => <li>{res.name}</li> )}</ul>;
}
