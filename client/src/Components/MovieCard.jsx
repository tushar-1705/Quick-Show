// import React from 'react'
// import { useNavigate } from 'react-router-dom'
// import {StarIcon} from 'lucide-react'
// import TimeFormat from '../Lib/TimeFormat';
// import { useAppContext } from '../context/AppContext';
 
// const MovieCard = ({movie}) => {

//     const navigate = useNavigate();
//     const {image_base_url} = useAppContext();


//   return (
//     <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:translate-y-1 transition duration-300 w-66'>
//       <img 
//       onClick={() => {navigate(`/movies/${movie._id}`); scrollTo(0,0)}}
//       src={image_base_url + movie.backdrop_path} alt="" className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer' />

//       <p className='font-semibold mt-2 truncate'>{movie.title}</p>
//       <p className='text-sm text-gray-400 mt-2'>
//         {new Date(movie.release_date).getFullYear()} . {movie.genres.slice(0,2).map(genre => genre.name).join(" | ")} . {TimeFormat(movie.runtime)}
//       </p>

//       <div className='flex items-center justify-between mt-4 pb-3'>
//         <button 
//             onClick={() => {navigate(`/movies/${movie._id}`); scrollTo(0,0)}}
//             className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
//             Buy Ticket
//         </button>

//         <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
//           <StarIcon className='w-4 h-4 text-primary fill-primary' />
//           {movie.vote_average.toFixed(1)}
//         </p>
//       </div>
//     </div>
//   )
// }

// export default MovieCard


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StarIcon } from 'lucide-react';
import TimeFormat from '../Lib/TimeFormat';
import { useAppContext } from '../context/AppContext';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { image_base_url } = useAppContext();

  if (!movie) return null; // safety: don't render if no movie

  const genres = Array.isArray(movie.genres)
    ? movie.genres.slice(0, 2).map((genre) => genre.name).join(' | ')
    : '';

  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:translate-y-1 transition duration-300 w-66'>
      <img
        onClick={() => {
          navigate(`/movies/${movie._id}`);
          scrollTo(0, 0);
        }}
        src={image_base_url + movie.backdrop_path}
        alt={movie.title || 'Untitled'}
        className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer'
      />

      <p className='font-semibold mt-2 truncate'>{movie.title}</p>
      <p className='text-sm text-gray-400 mt-2'>
        {movie.release_date ? new Date(movie.release_date).getFullYear() : '—'}{' '}
        . {genres} . {movie.runtime ? TimeFormat(movie.runtime) : ''}
      </p>

      <div className='flex items-center justify-between mt-4 pb-3'>
        <button
          onClick={() => {
            navigate(`/movies/${movie._id}`);
            scrollTo(0, 0);
          }}
          className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
        >
          Buy Ticket
        </button>

        <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
          <StarIcon className='w-4 h-4 text-primary fill-primary' />
          {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
