import { useParams } from 'react-router-dom';

export default function ViewGame() {
	const { key } = useParams();

	return (
		<div>
			View one game: {key}
			<br />
			This page will contain the details / ability to edit things about an existing game you have already posted, and saving edits will update
			the Discord listings
		</div>
	);
}
