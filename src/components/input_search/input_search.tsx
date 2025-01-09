import React from 'react';
import { SearchContainer, SearchInput as StyledInput, SearchIcon } from '../input_search/style_input_search';

interface SearchFieldProps {
  onSearchChange: (value: string) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({ onSearchChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <SearchContainer>
      <StyledInput
        type="text"
        placeholder="Buscar garantia"
        onChange={handleChange}
      />
      <SearchIcon />
    </SearchContainer>
  );
};

export default SearchField;
