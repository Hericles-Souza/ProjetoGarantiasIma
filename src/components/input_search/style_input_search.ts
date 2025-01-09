import styled from 'styled-components';
import { SearchOutlined } from '@ant-design/icons';

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding-right:15px;
  padding-left: 10px;
  background-color: white;
  height: 40px;
`;

export const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  padding: 8px;
  background-color: transparent;
  font-size: 14px;
  color: #161616;
`;

export const SearchIcon = styled(SearchOutlined)`
  font-size: 16px;
  color: #aaa;
  cursor: pointer;
`;
