import React from 'react';
import { SearchContainer, SearchInput as StyledInput, SearchIcon } from '../input_search/style_input_search';

interface SearchFieldProps {
  onSearchChange: (value: string) => void;
  searchTerm: string; // Adicione esta linha
  tabKey: string; // Adicione esta linha para forçar reset
}

const SearchField: React.FC<SearchFieldProps> = ({ 
  onSearchChange, 
  searchTerm, 
  tabKey 
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <SearchContainer>
      <StyledInput
        type="text"
        placeholder="Busque por uma solicitação"
        onChange={handleChange}
        value={searchTerm} // Controla o valor pelo estado
        key={tabKey} // Reseta o campo ao trocar de tab
      />
      <SearchIcon />
    </SearchContainer>
  );
};

export default SearchField;
