import styled from 'styled-components';

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  outline: none;
  height: 70px;
  background-color: #F9F9F9;
  border-bottom: 1px solid #ddd;
`;

export const TabContainer = styled.div`
  outline: none;
  margin-left: 20px;
  display: flex;
`;

export const Tab = styled.button<{ isActive: boolean }>`
  background: white;
  color: ${({ isActive }) => (isActive ? '#FF4D4D' : '#333')};
  border: ${({ isActive }) => (isActive ? '1px solid #FF4D4D' : '1.5px solid #ddd')};
  border-radius: 5px;
  padding: 8px 16px;
  outline: none;
  margin-right: 5px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #e43e3e;
    border: 1px solid #FF4D4D;
    color: #FFFFFF; 
    outline: none;
  }
`;


export const Button = styled.button`
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-right: 15px;
  font-size: 14px;
  height: 40px;
  &:hover {
    background-color: #e43e3e;
  }
`;