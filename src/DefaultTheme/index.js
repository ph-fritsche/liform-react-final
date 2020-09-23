import { Form, FormErrors, Action } from './sections';
import { Container, Reset, Submit } from './render';
import { ArrayWidget } from './Array/ArrayWidget';
import { HiddenInput } from './Input/HiddenInput';
import { Input } from './Input/Input';
import { NumberInput } from './Input/NumberInput';
import { ObjectWidget } from './Object/ObjectWidget';
import { ButtonWidget } from './Button/ButtonWidget';
import { Choice } from './Choice/Choice';
import { ColorInput } from './Input/ColorInput';
import { FileInput } from './Input/FileInput';

export default {
    sections: {
        header: null,
        form: Form,
        footer: null,
        errors: FormErrors,
        action: Action,
    },
    render: {
        container: Container,
        reset: Reset,
        submit: Submit,
    },
    field: {
        // type
        array: ArrayWidget,
        boolean: {
            'render': Input,
            'type': 'checkbox',
        },
        integer: {
            'render': NumberInput,
        },
        number: {
            'render': NumberInput,
        },
        object: ObjectWidget,
        string: {
            'render': Input,
        },

        // block - symfony native types - https://symfony.com/doc/current/reference/forms/types.html
        button: ButtonWidget,
        choice: {
            'render': Choice,
        },
        color: {
            'render': ColorInput,
        },
        date: {
            'render': Input,
            'type': 'date',
        },
        datetime: {
            'render': Input,
            'type': 'datetime-local',
        },
        email: {
            'render': Input,
            'type': 'email',
        },
        file: {
            'render': FileInput,
        },
        hidden: {
            render: HiddenInput,
        },
        password: {
            'render': Input,
            'type': 'password',
        },
        radio: {
            'render': Input,
            'type': 'radio',
        },
        range: {
            'render': Input,
            'type': 'range',
        },
        search: {
            'render': Input,
            'type': 'search',
        },
        textarea: {
            'render': Input,
            'type': 'textarea',
        },
        time: {
            'render': Input,
            'type': 'time',
        },
        tel: {
            'render': Input,
            'type': 'tel',
        },
        url: {
            'render': Input,
            'type': 'url',
        },
        week: {
            'render': Input,
            'type': 'week',
        },
    },
}
