/**
 * Es-prefixed wrappers for every antd component.
 * Single import source: use EsCard, EsForm, EsInputBase, etc. from 'components'.
 */
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  List,
  Modal,
  Empty,
  Descriptions,
  Popconfirm,
  Tooltip,
  Spin,
  Statistic,
  Row,
  Col,
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Space,
  message,
} from 'antd';

export const EsCard = Card;
export const EsForm = Form;
export const EsInputBase = Input;
export const EsInputNumber = InputNumber;
export const EsSelect = Select;
export const EsRadio = Radio;
export const EsList = List;
export const EsModal = Modal;
export const EsEmpty = Empty;
export const EsDescriptions = Descriptions;
export const EsPopconfirm = Popconfirm;
export const EsTooltip = Tooltip;
export const EsSpin = Spin;
export const EsStatistic = Statistic;
export const EsRow = Row;
export const EsCol = Col;
export const EsLayout = Layout;
export const EsMenu = Menu;
export const EsDropdown = Dropdown;
export const EsAvatar = Avatar;
export const EsSpace = Space;
export { message as EsMessage };
