import React from 'react';
import MatIcons from 'react-native-vector-icons/MaterialIcons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
  onPress?: () => void;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style, onPress }) => {
  const IconComponent = MatIcons as any;
  return (
    <IconComponent 
      name={name} 
      size={size} 
      color={color} 
      style={style}
      onPress={onPress}
    />
  );
};

export default Icon;