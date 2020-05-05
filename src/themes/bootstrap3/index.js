import ColorWidget from "./ColorWidget";
import CheckboxWidget from "./CheckboxWidget";
import ChoiceWidget from "./ChoiceWidget";
import ChoiceExpandedWidget from "./ChoiceExpandedWidget";
import ChoiceMultipleExpandedWidget from "./ChoiceMultipleExpandedWidget";
import CompatibleDateTimeWidget from "./CompatibleDateTimeWidget";
import CompatibleDateWidget from "./CompatibleDateWidget";
import DateTimeWidget from "./DateTimeWidget";
import DateWidget from "./DateWidget";
import EmailWidget from "./EmailWidget";
import FileWidget from "./FileWidget";
import MoneyWidget from "./MoneyWidget";
import NumberWidget from "./NumberWidget";
import ObjectWidget from "./ObjectWidget";
import PasswordWidget from "./PasswordWidget";
import PercentWidget from "./PercentWidget";
import SearchWidget from "./SearchWidget";
import StringWidget from "./StringWidget";
import TextareaWidget from "./TextareaWidget";
import TimeWidget from "./TimeWidget";
import UrlWidget from "./UrlWidget";

export default {
  boolean: CheckboxWidget,
  choice: ChoiceWidget,
  "choice-expanded": ChoiceExpandedWidget,
  "choice-multiple-expanded": ChoiceMultipleExpandedWidget,
  color: ColorWidget,
  "compatible-date": CompatibleDateWidget,
  "compatible-datetime": CompatibleDateTimeWidget,
  date: DateWidget,
  datetime: DateTimeWidget,
  email: EmailWidget,
  file: FileWidget,
  integer: NumberWidget,
  money: MoneyWidget,
  number: NumberWidget,
  object: ObjectWidget,
  password: PasswordWidget,
  percent: PercentWidget,
  search: SearchWidget,
  string: StringWidget,
  textarea: TextareaWidget,
  time: TimeWidget,
  url: UrlWidget,
};
