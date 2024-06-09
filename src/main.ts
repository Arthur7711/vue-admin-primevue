import { createApp } from 'vue';
import router from './router';
import App from '@/App.vue';
import simplebar from 'simplebar-vue';
// import 'ant-design-vue/lib/notification/style/index.css'
import 'ant-design-vue/dist/antd.min.css';
import './assets/scss/_index.scss';
import 'simplebar-vue/dist/simplebar.min.css';

import {
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Modal,
  RangePicker,
  Select,
  Spin,
  Table,
  Tooltip,
  SelectOption,
  Col,
  MenuItem,
  CheckboxGroup,
  Row,
  FormItem,
  Form,
  Textarea,
  Breadcrumb,
  InputSearch,
  Progress,
} from 'ant-design-vue';

const app = createApp(App);

app
  .component('simplebar', simplebar)
  .component('AButton', Button)
  .component('ACheckbox', Checkbox)
  .component('ADatePicker', DatePicker)
  .component('ADropdown', Dropdown)
  .component('AInput', Input)
  .component('AMenu', Menu)
  .component('AModal', Modal)
  .component('ARangePicker', RangePicker)
  .component('ASelect', Select)
  .component('ASelectOption', SelectOption)
  .component('ASpin', Spin)
  .component('ATable', Table)
  .component('ATooltip', Tooltip)
  .component('ACol', Col)
  .component('AMenuItem', MenuItem)
  .component('ACheckboxGroup', CheckboxGroup)
  .component('ARow', Row)
  .component('AFormItem', FormItem)
  .component('AForm', Form)
  .component('ATextarea', Textarea)
  .component('ABreadcrumb', Breadcrumb)
  .component('AInputSearch', InputSearch)
  .component('AProgress', Progress)
  .use(router)
  .mount('#app');

export default app;
