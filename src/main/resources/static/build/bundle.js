var app = (function () {
    'use strict';

    function noop$1() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run$1(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all$1(fns) {
        fns.forEach(run$1);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$1;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$1;
    }

    new Set();

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    // Needs to be written like this to pass the tree-shake-test
    'WeakMap' in globals ? new WeakMap() : undefined;
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    new Map();

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components$1 = [];
    const binding_callbacks$1 = [];
    let render_callbacks$1 = [];
    const flush_callbacks$1 = [];
    const resolved_promise$1 = /* @__PURE__ */ Promise.resolve();
    let update_scheduled$1 = false;
    function schedule_update$1() {
        if (!update_scheduled$1) {
            update_scheduled$1 = true;
            resolved_promise$1.then(flush$1);
        }
    }
    function tick$1() {
        schedule_update$1();
        return resolved_promise$1;
    }
    function add_render_callback$1(fn) {
        render_callbacks$1.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks$1 = new Set();
    let flushidx$1 = 0; // Do *not* move this inside the flush() function
    function flush$1() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx$1 !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx$1 < dirty_components$1.length) {
                    const component = dirty_components$1[flushidx$1];
                    flushidx$1++;
                    set_current_component(component);
                    update$1(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components$1.length = 0;
                flushidx$1 = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components$1.length = 0;
            flushidx$1 = 0;
            while (binding_callbacks$1.length)
                binding_callbacks$1.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks$1.length; i += 1) {
                const callback = render_callbacks$1[i];
                if (!seen_callbacks$1.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks$1.add(callback);
                    callback();
                }
            }
            render_callbacks$1.length = 0;
        } while (dirty_components$1.length);
        while (flush_callbacks$1.length) {
            flush_callbacks$1.pop()();
        }
        update_scheduled$1 = false;
        seen_callbacks$1.clear();
        set_current_component(saved_component);
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all$1($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback$1);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks$1.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks$1 = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all$1(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all$1(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    const _boolean_attributes = [
        'allowfullscreen',
        'allowpaymentrequest',
        'async',
        'autofocus',
        'autoplay',
        'checked',
        'controls',
        'default',
        'defer',
        'disabled',
        'formnovalidate',
        'hidden',
        'inert',
        'ismap',
        'loop',
        'multiple',
        'muted',
        'nomodule',
        'novalidate',
        'open',
        'playsinline',
        'readonly',
        'required',
        'reversed',
        'selected'
    ];
    /**
     * List of HTML boolean attributes (e.g. `<input disabled>`).
     * Source: https://html.spec.whatwg.org/multipage/indices.html
     */
    new Set([..._boolean_attributes]);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback$1(() => {
                const new_on_destroy = component.$$.on_mount.map(run$1).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all$1(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback$1);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all$1($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components$1.push(component);
            schedule_update$1();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all$1($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush$1();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop$1;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$1) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$1;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop$1;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop$1;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all$1(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.59.1 */

    const { Error: Error_1, Object: Object_1, console: console_1$4 } = globals;

    // (267:0) {:else}
    function create_else_block$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(267:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (260:0) {#if componentParams}
    function create_if_block$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(260:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick$1();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick$1();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick$1();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    function restoreScroll(state) {
    	// If this exists, then this is a back navigation: restore the scroll position
    	if (state) {
    		window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
    	} else {
    		// Otherwise this is a forward navigation: scroll to top
    		window.scrollTo(0, 0);
    	}
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick$1();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			restoreScroll(previousScrollState);
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick: tick$1,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		restoreScroll,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // user 
    const user = writable({});
    let sessionUser = sessionStorage.getItem("user");
    if (sessionUser) {
        user.set(JSON.parse(sessionUser));
    } else {
        // create the key "user" in the session storage if it doesn't exist yet
        sessionStorage.setItem("user", {});
    }
    // update the user in the sessionStorage on changes
    user.subscribe(user => sessionStorage.setItem("user", JSON.stringify(user)));


    // isAuthenticated: we assume that users are authenticated if the property "user.name" exists
    const isAuthenticated = derived(
    	user,
    	$user => $user && $user.name
    );

    // jwt_token 
    const jwt_token = writable("");
    let sessionToken = sessionStorage.getItem("jwt_token");
    if (sessionToken) {
        jwt_token.set(sessionToken);
    } else {
        // create the key "jwt_token" in the session storage if it doesn't exist yet
        sessionStorage.setItem("jwt_token", "");
    }
    // update the jwt_token in the sessionStorage on changes
    jwt_token.subscribe(jwt_token => sessionStorage.setItem("jwt_token", jwt_token));

    function bind(fn, thisArg) {
      return function wrap() {
        return fn.apply(thisArg, arguments);
      };
    }

    // utils is a library of generic helper functions non-specific to axios

    const {toString} = Object.prototype;
    const {getPrototypeOf} = Object;

    const kindOf = (cache => thing => {
        const str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(Object.create(null));

    const kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type
    };

    const typeOfTest = type => thing => typeof thing === type;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     *
     * @returns {boolean} True if value is an Array, otherwise false
     */
    const {isArray} = Array;

    /**
     * Determine if a value is undefined
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    const isUndefined = typeOfTest('undefined');

    /**
     * Determine if a value is a Buffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    const isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      let result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a String, otherwise false
     */
    const isString = typeOfTest('string');

    /**
     * Determine if a value is a Function
     *
     * @param {*} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    const isFunction = typeOfTest('function');

    /**
     * Determine if a value is a Number
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Number, otherwise false
     */
    const isNumber = typeOfTest('number');

    /**
     * Determine if a value is an Object
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an Object, otherwise false
     */
    const isObject = (thing) => thing !== null && typeof thing === 'object';

    /**
     * Determine if a value is a Boolean
     *
     * @param {*} thing The value to test
     * @returns {boolean} True if value is a Boolean, otherwise false
     */
    const isBoolean = thing => thing === true || thing === false;

    /**
     * Determine if a value is a plain Object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a plain Object, otherwise false
     */
    const isPlainObject = (val) => {
      if (kindOf(val) !== 'object') {
        return false;
      }

      const prototype = getPrototypeOf(val);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
    };

    /**
     * Determine if a value is a Date
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Date, otherwise false
     */
    const isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    const isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Stream
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    const isStream = (val) => isObject(val) && isFunction(val.pipe);

    /**
     * Determine if a value is a FormData
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    const isFormData = (thing) => {
      let kind;
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) || (
          isFunction(thing.append) && (
            (kind = kindOf(thing)) === 'formdata' ||
            // detect form-data instance
            (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
          )
        )
      )
    };

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    const isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     *
     * @returns {String} The String freed of excess whitespace
     */
    const trim = (str) => str.trim ?
      str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     *
     * @param {Boolean} [allOwnKeys = false]
     * @returns {any}
     */
    function forEach(obj, fn, {allOwnKeys = false} = {}) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      let i;
      let l;

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;

        for (i = 0; i < len; i++) {
          key = keys[i];
          fn.call(null, obj[key], key, obj);
        }
      }
    }

    function findKey(obj, key) {
      key = key.toLowerCase();
      const keys = Object.keys(obj);
      let i = keys.length;
      let _key;
      while (i-- > 0) {
        _key = keys[i];
        if (key === _key.toLowerCase()) {
          return _key;
        }
      }
      return null;
    }

    const _global = (() => {
      /*eslint no-undef:0*/
      if (typeof globalThis !== "undefined") return globalThis;
      return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
    })();

    const isContextDefined = (context) => !isUndefined(context) && context !== _global;

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     *
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      const {caseless} = isContextDefined(this) && this || {};
      const result = {};
      const assignValue = (val, key) => {
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
          result[targetKey] = merge(result[targetKey], val);
        } else if (isPlainObject(val)) {
          result[targetKey] = merge({}, val);
        } else if (isArray(val)) {
          result[targetKey] = val.slice();
        } else {
          result[targetKey] = val;
        }
      };

      for (let i = 0, l = arguments.length; i < l; i++) {
        arguments[i] && forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     *
     * @param {Boolean} [allOwnKeys]
     * @returns {Object} The resulting value of object a
     */
    const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
      forEach(b, (val, key) => {
        if (thisArg && isFunction(val)) {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      }, {allOwnKeys});
      return a;
    };

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     *
     * @returns {string} content value without BOM
     */
    const stripBOM = (content) => {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    };

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     *
     * @returns {void}
     */
    const inherits = (constructor, superConstructor, props, descriptors) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      Object.defineProperty(constructor, 'super', {
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function|Boolean} [filter]
     * @param {Function} [propFilter]
     *
     * @returns {Object}
     */
    const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
      let props;
      let i;
      let prop;
      const merged = {};

      destObj = destObj || {};
      // eslint-disable-next-line no-eq-null,eqeqeq
      if (sourceObj == null) return destObj;

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = filter !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    };

    /**
     * Determines whether a string ends with the characters of a specified string
     *
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     *
     * @returns {boolean}
     */
    const endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };


    /**
     * Returns new array from array like object or null if failed
     *
     * @param {*} [thing]
     *
     * @returns {?Array}
     */
    const toArray = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };

    /**
     * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
     * thing passed in is an instance of Uint8Array
     *
     * @param {TypedArray}
     *
     * @returns {Array}
     */
    // eslint-disable-next-line func-names
    const isTypedArray = (TypedArray => {
      // eslint-disable-next-line func-names
      return thing => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

    /**
     * For each entry in the object, call the function with the key and value.
     *
     * @param {Object<any, any>} obj - The object to iterate over.
     * @param {Function} fn - The function to call for each entry.
     *
     * @returns {void}
     */
    const forEachEntry = (obj, fn) => {
      const generator = obj && obj[Symbol.iterator];

      const iterator = generator.call(obj);

      let result;

      while ((result = iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };

    /**
     * It takes a regular expression and a string, and returns an array of all the matches
     *
     * @param {string} regExp - The regular expression to match against.
     * @param {string} str - The string to search.
     *
     * @returns {Array<boolean>}
     */
    const matchAll = (regExp, str) => {
      let matches;
      const arr = [];

      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }

      return arr;
    };

    /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
    const isHTMLForm = kindOfTest('HTMLFormElement');

    const toCamelCase = str => {
      return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
          return p1.toUpperCase() + p2;
        }
      );
    };

    /* Creating a function that will check if an object has a property. */
    const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

    /**
     * Determine if a value is a RegExp object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a RegExp object, otherwise false
     */
    const isRegExp = kindOfTest('RegExp');

    const reduceDescriptors = (obj, reducer) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};

      forEach(descriptors, (descriptor, name) => {
        if (reducer(descriptor, name, obj) !== false) {
          reducedDescriptors[name] = descriptor;
        }
      });

      Object.defineProperties(obj, reducedDescriptors);
    };

    /**
     * Makes all methods read-only
     * @param {Object} obj
     */

    const freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        // skip restricted props in strict mode
        if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
          return false;
        }

        const value = obj[name];

        if (!isFunction(value)) return;

        descriptor.enumerable = false;

        if ('writable' in descriptor) {
          descriptor.writable = false;
          return;
        }

        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error('Can not rewrite read-only method \'' + name + '\'');
          };
        }
      });
    };

    const toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};

      const define = (arr) => {
        arr.forEach(value => {
          obj[value] = true;
        });
      };

      isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

      return obj;
    };

    const noop = () => {};

    const toFiniteNumber = (value, defaultValue) => {
      value = +value;
      return Number.isFinite(value) ? value : defaultValue;
    };

    const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

    const DIGIT = '0123456789';

    const ALPHABET = {
      DIGIT,
      ALPHA,
      ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
    };

    const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
      let str = '';
      const {length} = alphabet;
      while (size--) {
        str += alphabet[Math.random() * length|0];
      }

      return str;
    };

    /**
     * If the thing is a FormData object, return true, otherwise return false.
     *
     * @param {unknown} thing - The thing to check.
     *
     * @returns {boolean}
     */
    function isSpecCompliantForm(thing) {
      return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
    }

    const toJSONObject = (obj) => {
      const stack = new Array(10);

      const visit = (source, i) => {

        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }

          if(!('toJSON' in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};

            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });

            stack[i] = undefined;

            return target;
          }
        }

        return source;
      };

      return visit(obj, 0);
    };

    const isAsyncFn = kindOfTest('AsyncFunction');

    const isThenable = (thing) =>
      thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);

    var utils = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isBoolean,
      isObject,
      isPlainObject,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isRegExp,
      isFunction,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
      reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop,
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      ALPHABET,
      generateString,
      isSpecCompliantForm,
      toJSONObject,
      isAsyncFn,
      isThenable
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     *
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = (new Error()).stack;
      }

      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: utils.toJSONObject(this.config),
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    const prototype$1 = AxiosError.prototype;
    const descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED',
      'ERR_NOT_SUPPORT',
      'ERR_INVALID_URL'
    // eslint-disable-next-line func-names
    ].forEach(code => {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = (error, code, config, request, response, customProps) => {
      const axiosError = Object.create(prototype$1);

      utils.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      }, prop => {
        return prop !== 'isAxiosError';
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.cause = error;

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    // eslint-disable-next-line strict
    var httpAdapter = null;

    /**
     * Determines if the given thing is a array or js object.
     *
     * @param {string} thing - The object or array to be visited.
     *
     * @returns {boolean}
     */
    function isVisitable(thing) {
      return utils.isPlainObject(thing) || utils.isArray(thing);
    }

    /**
     * It removes the brackets from the end of a string
     *
     * @param {string} key - The key of the parameter.
     *
     * @returns {string} the key without the brackets.
     */
    function removeBrackets(key) {
      return utils.endsWith(key, '[]') ? key.slice(0, -2) : key;
    }

    /**
     * It takes a path, a key, and a boolean, and returns a string
     *
     * @param {string} path - The path to the current key.
     * @param {string} key - The key of the current object being iterated over.
     * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
     *
     * @returns {string} The path to the current key.
     */
    function renderKey(path, key, dots) {
      if (!path) return key;
      return path.concat(key).map(function each(token, i) {
        // eslint-disable-next-line no-param-reassign
        token = removeBrackets(token);
        return !dots && i ? '[' + token + ']' : token;
      }).join(dots ? '.' : '');
    }

    /**
     * If the array is an array and none of its elements are visitable, then it's a flat array.
     *
     * @param {Array<any>} arr - The array to check
     *
     * @returns {boolean}
     */
    function isFlatArray(arr) {
      return utils.isArray(arr) && !arr.some(isVisitable);
    }

    const predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
      return /^is[A-Z]/.test(prop);
    });

    /**
     * Convert a data object to FormData
     *
     * @param {Object} obj
     * @param {?Object} [formData]
     * @param {?Object} [options]
     * @param {Function} [options.visitor]
     * @param {Boolean} [options.metaTokens = true]
     * @param {Boolean} [options.dots = false]
     * @param {?Boolean} [options.indexes = false]
     *
     * @returns {Object}
     **/

    /**
     * It converts an object into a FormData object
     *
     * @param {Object<any, any>} obj - The object to convert to form data.
     * @param {string} formData - The FormData object to append to.
     * @param {Object<string, any>} options
     *
     * @returns
     */
    function toFormData(obj, formData, options) {
      if (!utils.isObject(obj)) {
        throw new TypeError('target must be an object');
      }

      // eslint-disable-next-line no-param-reassign
      formData = formData || new (FormData)();

      // eslint-disable-next-line no-param-reassign
      options = utils.toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
      }, false, function defined(option, source) {
        // eslint-disable-next-line no-eq-null,eqeqeq
        return !utils.isUndefined(source[option]);
      });

      const metaTokens = options.metaTokens;
      // eslint-disable-next-line no-use-before-define
      const visitor = options.visitor || defaultVisitor;
      const dots = options.dots;
      const indexes = options.indexes;
      const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
      const useBlob = _Blob && utils.isSpecCompliantForm(formData);

      if (!utils.isFunction(visitor)) {
        throw new TypeError('visitor must be a function');
      }

      function convertValue(value) {
        if (value === null) return '';

        if (utils.isDate(value)) {
          return value.toISOString();
        }

        if (!useBlob && utils.isBlob(value)) {
          throw new AxiosError('Blob is not supported. Use a Buffer instead.');
        }

        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
          return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      /**
       * Default visitor.
       *
       * @param {*} value
       * @param {String|Number} key
       * @param {Array<String|Number>} path
       * @this {FormData}
       *
       * @returns {boolean} return true to visit the each prop of the value recursively
       */
      function defaultVisitor(value, key, path) {
        let arr = value;

        if (value && !path && typeof value === 'object') {
          if (utils.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            key = metaTokens ? key : key.slice(0, -2);
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (
            (utils.isArray(value) && isFlatArray(value)) ||
            ((utils.isFileList(value) || utils.endsWith(key, '[]')) && (arr = utils.toArray(value))
            )) {
            // eslint-disable-next-line no-param-reassign
            key = removeBrackets(key);

            arr.forEach(function each(el, index) {
              !(utils.isUndefined(el) || el === null) && formData.append(
                // eslint-disable-next-line no-nested-ternary
                indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
                convertValue(el)
              );
            });
            return false;
          }
        }

        if (isVisitable(value)) {
          return true;
        }

        formData.append(renderKey(path, key, dots), convertValue(value));

        return false;
      }

      const stack = [];

      const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
      });

      function build(value, path) {
        if (utils.isUndefined(value)) return;

        if (stack.indexOf(value) !== -1) {
          throw Error('Circular reference detected in ' + path.join('.'));
        }

        stack.push(value);

        utils.forEach(value, function each(el, key) {
          const result = !(utils.isUndefined(el) || el === null) && visitor.call(
            formData, el, utils.isString(key) ? key.trim() : key, path, exposedHelpers
          );

          if (result === true) {
            build(el, path ? path.concat(key) : [key]);
          }
        });

        stack.pop();
      }

      if (!utils.isObject(obj)) {
        throw new TypeError('data must be an object');
      }

      build(obj);

      return formData;
    }

    /**
     * It encodes a string by replacing all characters that are not in the unreserved set with
     * their percent-encoded equivalents
     *
     * @param {string} str - The string to encode.
     *
     * @returns {string} The encoded string.
     */
    function encode$1(str) {
      const charMap = {
        '!': '%21',
        "'": '%27',
        '(': '%28',
        ')': '%29',
        '~': '%7E',
        '%20': '+',
        '%00': '\x00'
      };
      return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
      });
    }

    /**
     * It takes a params object and converts it to a FormData object
     *
     * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
     * @param {Object<string, any>} options - The options object passed to the Axios constructor.
     *
     * @returns {void}
     */
    function AxiosURLSearchParams(params, options) {
      this._pairs = [];

      params && toFormData(params, this, options);
    }

    const prototype = AxiosURLSearchParams.prototype;

    prototype.append = function append(name, value) {
      this._pairs.push([name, value]);
    };

    prototype.toString = function toString(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode$1);
      } : encode$1;

      return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
      }, '').join('&');
    };

    /**
     * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
     * URI encoded counterparts
     *
     * @param {string} val The value to be encoded.
     *
     * @returns {string} The encoded value.
     */
    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @param {?object} options
     *
     * @returns {string} The formatted url
     */
    function buildURL(url, params, options) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }
      
      const _encode = options && options.encode || encode;

      const serializeFn = options && options.serialize;

      let serializedParams;

      if (serializeFn) {
        serializedParams = serializeFn(params, options);
      } else {
        serializedParams = utils.isURLSearchParams(params) ?
          params.toString() :
          new AxiosURLSearchParams(params, options).toString(_encode);
      }

      if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");

        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    }

    class InterceptorManager {
      constructor() {
        this.handlers = [];
      }

      /**
       * Add a new interceptor to the stack
       *
       * @param {Function} fulfilled The function to handle `then` for a `Promise`
       * @param {Function} rejected The function to handle `reject` for a `Promise`
       *
       * @return {Number} An ID used to remove interceptor later
       */
      use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }

      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
       */
      eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }

      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
      clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }

      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
      forEach(fn) {
        utils.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    }

    var InterceptorManager$1 = InterceptorManager;

    var transitionalDefaults = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

    var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

    var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     *
     * @returns {boolean}
     */
    const isStandardBrowserEnv = (() => {
      let product;
      if (typeof navigator !== 'undefined' && (
        (product = navigator.product) === 'ReactNative' ||
        product === 'NativeScript' ||
        product === 'NS')
      ) {
        return false;
      }

      return typeof window !== 'undefined' && typeof document !== 'undefined';
    })();

    /**
     * Determine if we're running in a standard browser webWorker environment
     *
     * Although the `isStandardBrowserEnv` method indicates that
     * `allows axios to run in a web worker`, the WebWorker will still be
     * filtered out due to its judgment standard
     * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
     * This leads to a problem when axios post `FormData` in webWorker
     */
     const isStandardBrowserWebWorkerEnv = (() => {
      return (
        typeof WorkerGlobalScope !== 'undefined' &&
        // eslint-disable-next-line no-undef
        self instanceof WorkerGlobalScope &&
        typeof self.importScripts === 'function'
      );
    })();


    var platform = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob: Blob$1
      },
      isStandardBrowserEnv,
      isStandardBrowserWebWorkerEnv,
      protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
    };

    function toURLEncodedForm(data, options) {
      return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
        visitor: function(value, key, path, helpers) {
          if (platform.isNode && utils.isBuffer(value)) {
            this.append(key, value.toString('base64'));
            return false;
          }

          return helpers.defaultVisitor.apply(this, arguments);
        }
      }, options));
    }

    /**
     * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
     *
     * @param {string} name - The name of the property to get.
     *
     * @returns An array of strings.
     */
    function parsePropPath(name) {
      // foo[x][y][z]
      // foo.x.y.z
      // foo-x-y-z
      // foo x y z
      return utils.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
        return match[0] === '[]' ? '' : match[1] || match[0];
      });
    }

    /**
     * Convert an array to an object.
     *
     * @param {Array<any>} arr - The array to convert to an object.
     *
     * @returns An object with the same keys and values as the array.
     */
    function arrayToObject(arr) {
      const obj = {};
      const keys = Object.keys(arr);
      let i;
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        obj[key] = arr[key];
      }
      return obj;
    }

    /**
     * It takes a FormData object and returns a JavaScript object
     *
     * @param {string} formData The FormData object to convert to JSON.
     *
     * @returns {Object<string, any> | null} The converted object.
     */
    function formDataToJSON(formData) {
      function buildPath(path, value, target, index) {
        let name = path[index++];
        const isNumericKey = Number.isFinite(+name);
        const isLast = index >= path.length;
        name = !name && utils.isArray(target) ? target.length : name;

        if (isLast) {
          if (utils.hasOwnProp(target, name)) {
            target[name] = [target[name], value];
          } else {
            target[name] = value;
          }

          return !isNumericKey;
        }

        if (!target[name] || !utils.isObject(target[name])) {
          target[name] = [];
        }

        const result = buildPath(path, value, target[name], index);

        if (result && utils.isArray(target[name])) {
          target[name] = arrayToObject(target[name]);
        }

        return !isNumericKey;
      }

      if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
        const obj = {};

        utils.forEachEntry(formData, (name, value) => {
          buildPath(parsePropPath(name), value, obj, 0);
        });

        return obj;
      }

      return null;
    }

    const DEFAULT_CONTENT_TYPE = {
      'Content-Type': undefined
    };

    /**
     * It takes a string, tries to parse it, and if it fails, it returns the stringified version
     * of the input
     *
     * @param {any} rawValue - The value to be stringified.
     * @param {Function} parser - A function that parses a string into a JavaScript object.
     * @param {Function} encoder - A function that takes a value and returns a string.
     *
     * @returns {string} A stringified version of the rawValue.
     */
    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    const defaults = {

      transitional: transitionalDefaults,

      adapter: ['xhr', 'http'],

      transformRequest: [function transformRequest(data, headers) {
        const contentType = headers.getContentType() || '';
        const hasJSONContentType = contentType.indexOf('application/json') > -1;
        const isObjectPayload = utils.isObject(data);

        if (isObjectPayload && utils.isHTMLForm(data)) {
          data = new FormData(data);
        }

        const isFormData = utils.isFormData(data);

        if (isFormData) {
          if (!hasJSONContentType) {
            return data;
          }
          return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
        }

        if (utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
          return data.toString();
        }

        let isFileList;

        if (isObjectPayload) {
          if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
            return toURLEncodedForm(data, this.formSerializer).toString();
          }

          if ((isFileList = utils.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
            const _FormData = this.env && this.env.FormData;

            return toFormData(
              isFileList ? {'files[]': data} : data,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }

        if (isObjectPayload || hasJSONContentType ) {
          headers.setContentType('application/json', false);
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        const transitional = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === 'json';

        if (data && utils.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;

          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: platform.classes.FormData,
        Blob: platform.classes.Blob
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults$1 = defaults;

    // RawAxiosHeaders whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    const ignoreDuplicateOf = utils.toObjectSet([
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ]);

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} rawHeaders Headers needing to be parsed
     *
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = rawHeaders => {
      const parsed = {};
      let key;
      let val;
      let i;

      rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();

        if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
          return;
        }

        if (key === 'set-cookie') {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      });

      return parsed;
    };

    const $internals = Symbol('internals');

    function normalizeHeader(header) {
      return header && String(header).trim().toLowerCase();
    }

    function normalizeValue(value) {
      if (value === false || value == null) {
        return value;
      }

      return utils.isArray(value) ? value.map(normalizeValue) : String(value);
    }

    function parseTokens(str) {
      const tokens = Object.create(null);
      const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
      let match;

      while ((match = tokensRE.exec(str))) {
        tokens[match[1]] = match[2];
      }

      return tokens;
    }

    const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

    function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
      if (utils.isFunction(filter)) {
        return filter.call(this, value, header);
      }

      if (isHeaderNameFilter) {
        value = header;
      }

      if (!utils.isString(value)) return;

      if (utils.isString(filter)) {
        return value.indexOf(filter) !== -1;
      }

      if (utils.isRegExp(filter)) {
        return filter.test(value);
      }
    }

    function formatHeader(header) {
      return header.trim()
        .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
          return char.toUpperCase() + str;
        });
    }

    function buildAccessors(obj, header) {
      const accessorName = utils.toCamelCase(' ' + header);

      ['get', 'set', 'has'].forEach(methodName => {
        Object.defineProperty(obj, methodName + accessorName, {
          value: function(arg1, arg2, arg3) {
            return this[methodName].call(this, header, arg1, arg2, arg3);
          },
          configurable: true
        });
      });
    }

    class AxiosHeaders {
      constructor(headers) {
        headers && this.set(headers);
      }

      set(header, valueOrRewrite, rewrite) {
        const self = this;

        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);

          if (!lHeader) {
            throw new Error('header name must be a non-empty string');
          }

          const key = utils.findKey(self, lHeader);

          if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
            self[key || _header] = normalizeValue(_value);
          }
        }

        const setHeaders = (headers, _rewrite) =>
          utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

        if (utils.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if(utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders(header), valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }

        return this;
      }

      get(header, parser) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

          if (key) {
            const value = this[key];

            if (!parser) {
              return value;
            }

            if (parser === true) {
              return parseTokens(value);
            }

            if (utils.isFunction(parser)) {
              return parser.call(this, value, key);
            }

            if (utils.isRegExp(parser)) {
              return parser.exec(value);
            }

            throw new TypeError('parser must be boolean|regexp|function');
          }
        }
      }

      has(header, matcher) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

          return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }

        return false;
      }

      delete(header, matcher) {
        const self = this;
        let deleted = false;

        function deleteHeader(_header) {
          _header = normalizeHeader(_header);

          if (_header) {
            const key = utils.findKey(self, _header);

            if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
              delete self[key];

              deleted = true;
            }
          }
        }

        if (utils.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }

        return deleted;
      }

      clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;

        while (i--) {
          const key = keys[i];
          if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
            delete this[key];
            deleted = true;
          }
        }

        return deleted;
      }

      normalize(format) {
        const self = this;
        const headers = {};

        utils.forEach(this, (value, header) => {
          const key = utils.findKey(headers, header);

          if (key) {
            self[key] = normalizeValue(value);
            delete self[header];
            return;
          }

          const normalized = format ? formatHeader(header) : String(header).trim();

          if (normalized !== header) {
            delete self[header];
          }

          self[normalized] = normalizeValue(value);

          headers[normalized] = true;
        });

        return this;
      }

      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }

      toJSON(asStrings) {
        const obj = Object.create(null);

        utils.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils.isArray(value) ? value.join(', ') : value);
        });

        return obj;
      }

      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }

      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
      }

      get [Symbol.toStringTag]() {
        return 'AxiosHeaders';
      }

      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }

      static concat(first, ...targets) {
        const computed = new this(first);

        targets.forEach((target) => computed.set(target));

        return computed;
      }

      static accessor(header) {
        const internals = this[$internals] = (this[$internals] = {
          accessors: {}
        });

        const accessors = internals.accessors;
        const prototype = this.prototype;

        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);

          if (!accessors[lHeader]) {
            buildAccessors(prototype, _header);
            accessors[lHeader] = true;
          }
        }

        utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

        return this;
      }
    }

    AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

    utils.freezeMethods(AxiosHeaders.prototype);
    utils.freezeMethods(AxiosHeaders);

    var AxiosHeaders$1 = AxiosHeaders;

    /**
     * Transform the data for a request or a response
     *
     * @param {Array|Function} fns A single function or Array of functions
     * @param {?Object} response The response object
     *
     * @returns {*} The resulting transformed data
     */
    function transformData(fns, response) {
      const config = this || defaults$1;
      const context = response || config;
      const headers = AxiosHeaders$1.from(context.headers);
      let data = context.data;

      utils.forEach(fns, function transform(fn) {
        data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
      });

      headers.normalize();

      return data;
    }

    function isCancel(value) {
      return !!(value && value.__CANCEL__);
    }

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @param {string=} message The message.
     * @param {Object=} config The config.
     * @param {Object=} request The request.
     *
     * @returns {CanceledError} The created error.
     */
    function CanceledError(message, config, request) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED, config, request);
      this.name = 'CanceledError';
    }

    utils.inherits(CanceledError, AxiosError, {
      __CANCEL__: true
    });

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     *
     * @returns {object} The response.
     */
    function settle(resolve, reject, response) {
      const validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          'Request failed with status code ' + response.status,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    }

    var cookies = platform.isStandardBrowserEnv ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            const cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })();

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     *
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    }

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     *
     * @returns {string} The combined URL
     */
    function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    }

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     *
     * @returns {string} The combined full path
     */
    function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    }

    var isURLSameOrigin = platform.isStandardBrowserEnv ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        const msie = /(msie|trident)/i.test(navigator.userAgent);
        const urlParsingNode = document.createElement('a');
        let originURL;

        /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
        function resolveURL(url) {
          let href = url;

          if (msie) {
            // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
        return function isURLSameOrigin(requestURL) {
          const parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })();

    function parseProtocol(url) {
      const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    }

    /**
     * Calculate data maxRate
     * @param {Number} [samplesCount= 10]
     * @param {Number} [min= 1000]
     * @returns {Function}
     */
    function speedometer(samplesCount, min) {
      samplesCount = samplesCount || 10;
      const bytes = new Array(samplesCount);
      const timestamps = new Array(samplesCount);
      let head = 0;
      let tail = 0;
      let firstSampleTS;

      min = min !== undefined ? min : 1000;

      return function push(chunkLength) {
        const now = Date.now();

        const startedAt = timestamps[tail];

        if (!firstSampleTS) {
          firstSampleTS = now;
        }

        bytes[head] = chunkLength;
        timestamps[head] = now;

        let i = tail;
        let bytesCount = 0;

        while (i !== head) {
          bytesCount += bytes[i++];
          i = i % samplesCount;
        }

        head = (head + 1) % samplesCount;

        if (head === tail) {
          tail = (tail + 1) % samplesCount;
        }

        if (now - firstSampleTS < min) {
          return;
        }

        const passed = startedAt && now - startedAt;

        return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
      };
    }

    function progressEventReducer(listener, isDownloadStream) {
      let bytesNotified = 0;
      const _speedometer = speedometer(50, 250);

      return e => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : undefined;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;

        bytesNotified = loaded;

        const data = {
          loaded,
          total,
          progress: total ? (loaded / total) : undefined,
          bytes: progressBytes,
          rate: rate ? rate : undefined,
          estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
          event: e
        };

        data[isDownloadStream ? 'download' : 'upload'] = true;

        listener(data);
      };
    }

    const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

    var xhrAdapter = isXHRAdapterSupported && function (config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        let requestData = config.data;
        const requestHeaders = AxiosHeaders$1.from(config.headers).normalize();
        const responseType = config.responseType;
        let onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData)) {
          if (platform.isStandardBrowserEnv || platform.isStandardBrowserWebWorkerEnv) {
            requestHeaders.setContentType(false); // Let the browser set it
          } else {
            requestHeaders.setContentType('multipart/form-data;', false); // mobile/desktop app frameworks
          }
        }

        let request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          const username = config.auth.username || '';
          const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.set('Authorization', 'Basic ' + btoa(username + ':' + password));
        }

        const fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          const responseHeaders = AxiosHeaders$1.from(
            'getAllResponseHeaders' in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
            request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          const transitional = config.transitional || transitionalDefaults;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (platform.isStandardBrowserEnv) {
          // Add xsrf header
          const xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath))
            && config.xsrfCookieName && cookies.read(config.xsrfCookieName);

          if (xsrfValue) {
            requestHeaders.set(config.xsrfHeaderName, xsrfValue);
          }
        }

        // Remove Content-Type if data is undefined
        requestData === undefined && requestHeaders.setContentType(null);

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', progressEventReducer(config.onDownloadProgress, true));
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', progressEventReducer(config.onUploadProgress));
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = cancel => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        const protocol = parseProtocol(fullPath);

        if (protocol && platform.protocols.indexOf(protocol) === -1) {
          reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData || null);
      });
    };

    const knownAdapters = {
      http: httpAdapter,
      xhr: xhrAdapter
    };

    utils.forEach(knownAdapters, (fn, value) => {
      if(fn) {
        try {
          Object.defineProperty(fn, 'name', {value});
        } catch (e) {
          // eslint-disable-next-line no-empty
        }
        Object.defineProperty(fn, 'adapterName', {value});
      }
    });

    var adapters = {
      getAdapter: (adapters) => {
        adapters = utils.isArray(adapters) ? adapters : [adapters];

        const {length} = adapters;
        let nameOrAdapter;
        let adapter;

        for (let i = 0; i < length; i++) {
          nameOrAdapter = adapters[i];
          if((adapter = utils.isString(nameOrAdapter) ? knownAdapters[nameOrAdapter.toLowerCase()] : nameOrAdapter)) {
            break;
          }
        }

        if (!adapter) {
          if (adapter === false) {
            throw new AxiosError(
              `Adapter ${nameOrAdapter} is not supported by the environment`,
              'ERR_NOT_SUPPORT'
            );
          }

          throw new Error(
            utils.hasOwnProp(knownAdapters, nameOrAdapter) ?
              `Adapter '${nameOrAdapter}' is not available in the build` :
              `Unknown adapter '${nameOrAdapter}'`
          );
        }

        if (!utils.isFunction(adapter)) {
          throw new TypeError('adapter is not a function');
        }

        return adapter;
      },
      adapters: knownAdapters
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     *
     * @param {Object} config The config that is to be used for the request
     *
     * @returns {void}
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError(null, config);
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      config.headers = AxiosHeaders$1.from(config.headers);

      // Transform request data
      config.data = transformData.call(
        config,
        config.transformRequest
      );

      if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
        config.headers.setContentType('application/x-www-form-urlencoded', false);
      }

      const adapter = adapters.getAdapter(config.adapter || defaults$1.adapter);

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          config.transformResponse,
          response
        );

        response.headers = AxiosHeaders$1.from(response.headers);

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
            reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
          }
        }

        return Promise.reject(reason);
      });
    }

    const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? thing.toJSON() : thing;

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     *
     * @returns {Object} New object resulting from merging config2 to config1
     */
    function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      const config = {};

      function getMergedValue(target, source, caseless) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge.call({caseless}, target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(a, b, caseless) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(a, b, caseless);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a, caseless);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(a, b, prop) {
        if (prop in config2) {
          return getMergedValue(a, b);
        } else if (prop in config1) {
          return getMergedValue(undefined, a);
        }
      }

      const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
      };

      utils.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
        const merge = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge(config1[prop], config2[prop], prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    }

    const VERSION = "1.4.0";

    const validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    const deprecatedWarnings = {};

    /**
     * Transitional option validator
     *
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     *
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return (value, opt, opts) => {
        if (validator === false) {
          throw new AxiosError(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     *
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     *
     * @returns {object}
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
      }
      const keys = Object.keys(options);
      let i = keys.length;
      while (i-- > 0) {
        const opt = keys[i];
        const validator = schema[opt];
        if (validator) {
          const value = options[opt];
          const result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions,
      validators: validators$1
    };

    const validators = validator.validators;

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     *
     * @return {Axios} A new instance of Axios
     */
    class Axios {
      constructor(instanceConfig) {
        this.defaults = instanceConfig;
        this.interceptors = {
          request: new InterceptorManager$1(),
          response: new InterceptorManager$1()
        };
      }

      /**
       * Dispatch a request
       *
       * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
       * @param {?Object} config
       *
       * @returns {Promise} The Promise to be fulfilled
       */
      request(configOrUrl, config) {
        /*eslint no-param-reassign:0*/
        // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof configOrUrl === 'string') {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }

        config = mergeConfig(this.defaults, config);

        const {transitional, paramsSerializer, headers} = config;

        if (transitional !== undefined) {
          validator.assertOptions(transitional, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, false);
        }

        if (paramsSerializer != null) {
          if (utils.isFunction(paramsSerializer)) {
            config.paramsSerializer = {
              serialize: paramsSerializer
            };
          } else {
            validator.assertOptions(paramsSerializer, {
              encode: validators.function,
              serialize: validators.function
            }, true);
          }
        }

        // Set config.method
        config.method = (config.method || this.defaults.method || 'get').toLowerCase();

        let contextHeaders;

        // Flatten headers
        contextHeaders = headers && utils.merge(
          headers.common,
          headers[config.method]
        );

        contextHeaders && utils.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
          (method) => {
            delete headers[method];
          }
        );

        config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

        // filter out skipped interceptors
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
            return;
          }

          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });

        let promise;
        let i = 0;
        let len;

        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), undefined];
          chain.unshift.apply(chain, requestInterceptorChain);
          chain.push.apply(chain, responseInterceptorChain);
          len = chain.length;

          promise = Promise.resolve(config);

          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }

          return promise;
        }

        len = requestInterceptorChain.length;

        let newConfig = config;

        i = 0;

        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected.call(this, error);
            break;
          }
        }

        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }

        i = 0;
        len = responseInterceptorChain.length;

        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }

        return promise;
      }

      getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    }

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url,
            data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios$1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @param {Function} executor The executor function.
     *
     * @returns {CancelToken}
     */
    class CancelToken {
      constructor(executor) {
        if (typeof executor !== 'function') {
          throw new TypeError('executor must be a function.');
        }

        let resolvePromise;

        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });

        const token = this;

        // eslint-disable-next-line func-names
        this.promise.then(cancel => {
          if (!token._listeners) return;

          let i = token._listeners.length;

          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });

        // eslint-disable-next-line func-names
        this.promise.then = onfulfilled => {
          let _resolve;
          // eslint-disable-next-line func-names
          const promise = new Promise(resolve => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);

          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };

          return promise;
        };

        executor(function cancel(message, config, request) {
          if (token.reason) {
            // Cancellation has already been requested
            return;
          }

          token.reason = new CanceledError(message, config, request);
          resolvePromise(token.reason);
        });
      }

      /**
       * Throws a `CanceledError` if cancellation has been requested.
       */
      throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }

      /**
       * Subscribe to the cancel signal
       */

      subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }

        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }

      /**
       * Unsubscribe from the cancel signal
       */

      unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      }

      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
      static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    }

    var CancelToken$1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     *
     * @returns {Function}
     */
    function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    }

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     *
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    }

    const HttpStatusCode = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511,
    };

    Object.entries(HttpStatusCode).forEach(([key, value]) => {
      HttpStatusCode[value] = key;
    });

    var HttpStatusCode$1 = HttpStatusCode;

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     *
     * @returns {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      const context = new Axios$1(defaultConfig);
      const instance = bind(Axios$1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

      // Copy context to instance
      utils.extend(instance, context, null, {allOwnKeys: true});

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    const axios = createInstance(defaults$1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios$1;

    // Expose Cancel & CancelToken
    axios.CanceledError = CanceledError;
    axios.CancelToken = CancelToken$1;
    axios.isCancel = isCancel;
    axios.VERSION = VERSION;
    axios.toFormData = toFormData;

    // Expose AxiosError class
    axios.AxiosError = AxiosError;

    // alias for CanceledError for backward compatibility
    axios.Cancel = axios.CanceledError;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };

    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    // Expose mergeConfig
    axios.mergeConfig = mergeConfig;

    axios.AxiosHeaders = AxiosHeaders$1;

    axios.formToJSON = thing => formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);

    axios.HttpStatusCode = HttpStatusCode$1;

    axios.default = axios;

    // this module should only have a default export
    var axios$1 = axios;

    /* src\pages\Home.svelte generated by Svelte v3.59.1 */

    const { console: console_1$3 } = globals;
    const file$7 = "src\\pages\\Home.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (119:0) {:else}
    function create_else_block$2(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "loader svelte-63pg8r");
    			add_location(div0, file$7, 120, 8, 4252);
    			attr_dev(div1, "class", "loader-container svelte-63pg8r");
    			add_location(div1, file$7, 119, 4, 4212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(119:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:0) {#if !loading}
    function create_if_block$4(ctx) {
    	let div2;
    	let t0;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2;
    	let if_block0 = /*$isAuthenticated*/ ctx[6] && create_if_block_3$1(ctx);
    	let if_block1 = /*$isAuthenticated*/ ctx[6] && /*playerLevel*/ ctx[2] !== "COMPLETED" && create_if_block_2$2(ctx);
    	let if_block2 = /*$isAuthenticated*/ ctx[6] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(img, "class", "guessit-logo svelte-63pg8r");
    			if (!src_url_equal(img.src, img_src_value = "/images/background.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "GuessITLogo");
    			add_location(img, file$7, 83, 16, 2718);
    			attr_dev(div0, "class", "guessit");
    			add_location(div0, file$7, 82, 12, 2679);
    			attr_dev(div1, "class", "col col-fixed empty-column svelte-63pg8r");
    			add_location(div1, file$7, 81, 8, 2625);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$7, 51, 4, 1391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t1);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div2, t2);
    			if (if_block2) if_block2.m(div2, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*$isAuthenticated*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$isAuthenticated*/ ctx[6] && /*playerLevel*/ ctx[2] !== "COMPLETED") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$isAuthenticated*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$2(ctx);
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(51:0) {#if !loading}",
    		ctx
    	});

    	return block;
    }

    // (53:8) {#if $isAuthenticated}
    function create_if_block_3$1(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h5;
    	let t1;
    	let t2;
    	let p0;
    	let t3;
    	let p1;
    	let b0;
    	let t5;
    	let t6;
    	let t7;
    	let p2;
    	let b1;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let p3;
    	let b2;
    	let t14;
    	let t15_value = /*$user*/ ctx[7].email + "";
    	let t15;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h5 = element("h5");
    			t1 = text(/*username*/ ctx[1]);
    			t2 = space();
    			p0 = element("p");
    			t3 = space();
    			p1 = element("p");
    			b0 = element("b");
    			b0.textContent = "Score:";
    			t5 = space();
    			t6 = text(/*score*/ ctx[4]);
    			t7 = space();
    			p2 = element("p");
    			b1 = element("b");
    			b1.textContent = "Average Deviation:";
    			t9 = space();
    			t10 = text(/*averageDeviation*/ ctx[3]);
    			t11 = text("%");
    			t12 = space();
    			p3 = element("p");
    			b2 = element("b");
    			b2.textContent = "Mail:";
    			t14 = space();
    			t15 = text(t15_value);
    			attr_dev(img, "class", "card-img-top robohash-img svelte-63pg8r");
    			attr_dev(img, "alt", "robohash");
    			if (!src_url_equal(img.src, img_src_value = /*playerDetails*/ ctx[0].roboHashUrl)) attr_dev(img, "src", img_src_value);
    			add_location(img, file$7, 60, 24, 1761);
    			attr_dev(div0, "class", "card-header");
    			add_location(div0, file$7, 59, 20, 1710);
    			attr_dev(h5, "class", "card-title text-center");
    			set_style(h5, "text-decoration", "underline");
    			add_location(h5, file$7, 67, 24, 2062);
    			attr_dev(p0, "class", "card-text");
    			add_location(p0, file$7, 73, 24, 2314);
    			add_location(b0, file$7, 74, 27, 2366);
    			add_location(p1, file$7, 74, 24, 2363);
    			add_location(b1, file$7, 75, 27, 2420);
    			add_location(p2, file$7, 75, 24, 2417);
    			add_location(b2, file$7, 76, 27, 2498);
    			add_location(p3, file$7, 76, 24, 2495);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file$7, 66, 20, 2013);
    			attr_dev(div2, "class", "card text-white bg-transparent border-light mb-3");
    			set_style(div2, "max-width", "18rem");
    			add_location(div2, file$7, 55, 16, 1540);
    			attr_dev(div3, "class", "col col-fixed svelte-63pg8r");
    			add_location(div3, file$7, 53, 12, 1454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h5);
    			append_dev(h5, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(div1, t3);
    			append_dev(div1, p1);
    			append_dev(p1, b0);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p2);
    			append_dev(p2, b1);
    			append_dev(p2, t9);
    			append_dev(p2, t10);
    			append_dev(p2, t11);
    			append_dev(div1, t12);
    			append_dev(div1, p3);
    			append_dev(p3, b2);
    			append_dev(p3, t14);
    			append_dev(p3, t15);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*playerDetails*/ 1 && !src_url_equal(img.src, img_src_value = /*playerDetails*/ ctx[0].roboHashUrl)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*username*/ 2) set_data_dev(t1, /*username*/ ctx[1]);
    			if (dirty & /*score*/ 16) set_data_dev(t6, /*score*/ ctx[4]);
    			if (dirty & /*averageDeviation*/ 8) set_data_dev(t10, /*averageDeviation*/ ctx[3]);
    			if (dirty & /*$user*/ 128 && t15_value !== (t15_value = /*$user*/ ctx[7].email + "")) set_data_dev(t15, t15_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(53:8) {#if $isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    // (89:16) {#if $isAuthenticated && playerLevel !== "COMPLETED"}
    function create_if_block_2$2(ctx) {
    	let div;
    	let a;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			a.textContent = "Play";
    			attr_dev(a, "href", "#/play/");
    			attr_dev(a, "class", "btn btn-primary svelte-63pg8r");
    			add_location(a, file$7, 91, 24, 3069);
    			attr_dev(div, "class", "play-button-container svelte-63pg8r");
    			add_location(div, file$7, 90, 20, 3008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(89:16) {#if $isAuthenticated && playerLevel !== \\\"COMPLETED\\\"}",
    		ctx
    	});

    	return block;
    }

    // (97:8) {#if $isAuthenticated}
    function create_if_block_1$2(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();

    	let each_value = [
    		"COMPLETED",
    		"LEVEL_7",
    		"LEVEL_6",
    		"LEVEL_5",
    		"LEVEL_4",
    		"LEVEL_3",
    		"LEVEL_2",
    		"LEVEL_1"
    	];

    	validate_each_argument(each_value);
    	const get_key = ctx => /*level*/ ctx[12];
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < 8; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < 8; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "level-boxes svelte-63pg8r");
    			add_location(div0, file$7, 102, 24, 3524);
    			attr_dev(div1, "class", "card-body levels svelte-63pg8r");
    			add_location(div1, file$7, 100, 20, 3422);
    			attr_dev(div2, "class", "card text-white bg-transparent border-light mb-3");
    			add_location(div2, file$7, 99, 16, 3338);
    			attr_dev(div3, "class", "col col-fixed svelte-63pg8r");
    			add_location(div3, file$7, 97, 12, 3252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < 8; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*playerLevel*/ 4) {
    				each_value = [
    					"COMPLETED",
    					"LEVEL_7",
    					"LEVEL_6",
    					"LEVEL_5",
    					"LEVEL_4",
    					"LEVEL_3",
    					"LEVEL_2",
    					"LEVEL_1"
    				];

    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block$3, null, get_each_context$3);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < 8; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(97:8) {#if $isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    // (104:28) {#each ["COMPLETED", "LEVEL_7", "LEVEL_6", "LEVEL_5", "LEVEL_4", "LEVEL_3", "LEVEL_2", "LEVEL_1"] as level (level)}
    function create_each_block$3(key_1, ctx) {
    	let div;
    	let t0;
    	let t1;
    	let div_class_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(/*level*/ ctx[12]);
    			t1 = space();

    			attr_dev(div, "class", div_class_value = "level-box " + (/*level*/ ctx[12] === /*playerLevel*/ ctx[2]
    			? 'active'
    			: '') + " svelte-63pg8r");

    			add_location(div, file$7, 104, 32, 3728);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*playerLevel*/ 4 && div_class_value !== (div_class_value = "level-box " + (/*level*/ ctx[12] === /*playerLevel*/ ctx[2]
    			? 'active'
    			: '') + " svelte-63pg8r")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(104:28) {#each [\\\"COMPLETED\\\", \\\"LEVEL_7\\\", \\\"LEVEL_6\\\", \\\"LEVEL_5\\\", \\\"LEVEL_4\\\", \\\"LEVEL_3\\\", \\\"LEVEL_2\\\", \\\"LEVEL_1\\\"] as level (level)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (!/*loading*/ ctx[5]) return create_if_block$4;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $jwt_token;
    	let $isAuthenticated;
    	let $user;
    	validate_store(jwt_token, 'jwt_token');
    	component_subscribe($$self, jwt_token, $$value => $$invalidate(9, $jwt_token = $$value));
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(6, $isAuthenticated = $$value));
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(7, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const api_root = window.location.origin;
    	let playerDetails;
    	let answeredQuestions = [];
    	let username;
    	let playerLevel;
    	let averageDeviation;
    	let score;
    	let loading = true;

    	onMount(async () => {
    		try {
    			await getPlayerDetails();
    			$$invalidate(5, loading = false);
    		} catch(error) {
    			console.error("Failed to fetch data:", error);
    		}
    	});

    	async function getPlayerDetails() {
    		var config = {
    			method: "get",
    			url: api_root + "/api/me/player",
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		try {
    			const response = await axios$1(config);
    			$$invalidate(0, playerDetails = response.data);
    			$$invalidate(2, playerLevel = response.data.playerLevelState);
    			$$invalidate(1, username = response.data.username);
    			answeredQuestions = response.data.answeredQuestions;
    			$$invalidate(3, averageDeviation = response.data.averageDeviation);
    			$$invalidate(4, score = response.data.score);
    			console.log(playerDetails);
    		} catch(error) {
    			alert("Signup again");
    			console.log(error);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		isAuthenticated,
    		user,
    		jwt_token,
    		onMount,
    		axios: axios$1,
    		api_root,
    		playerDetails,
    		answeredQuestions,
    		username,
    		playerLevel,
    		averageDeviation,
    		score,
    		loading,
    		getPlayerDetails,
    		$jwt_token,
    		$isAuthenticated,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ('playerDetails' in $$props) $$invalidate(0, playerDetails = $$props.playerDetails);
    		if ('answeredQuestions' in $$props) answeredQuestions = $$props.answeredQuestions;
    		if ('username' in $$props) $$invalidate(1, username = $$props.username);
    		if ('playerLevel' in $$props) $$invalidate(2, playerLevel = $$props.playerLevel);
    		if ('averageDeviation' in $$props) $$invalidate(3, averageDeviation = $$props.averageDeviation);
    		if ('score' in $$props) $$invalidate(4, score = $$props.score);
    		if ('loading' in $$props) $$invalidate(5, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		playerDetails,
    		username,
    		playerLevel,
    		averageDeviation,
    		score,
    		loading,
    		$isAuthenticated,
    		$user
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    let urlAlphabet =
      'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
    let nanoid = (size = 21) => {
      let id = '';
      let i = size;
      while (i--) {
        id += urlAlphabet[(Math.random() * 64) | 0];
      }
      return id
    };

    function run(fn) {
        return fn();
    }
    function run_all(fns) {
        fns.forEach(run);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                update(component.$$);
            }
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    const defaultOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0,
        unobserveOnEnter: false,
    };
    const createEvent = (name, detail) => new CustomEvent(name, { detail });
    function inview(node, options = {}) {
        const { root, rootMargin, threshold, unobserveOnEnter } = Object.assign(Object.assign({}, defaultOptions), options);
        let prevPos = {
            x: undefined,
            y: undefined,
        };
        let scrollDirection = {
            vertical: undefined,
            horizontal: undefined,
        };
        if (typeof IntersectionObserver !== 'undefined' && node) {
            const observer = new IntersectionObserver((entries, _observer) => {
                entries.forEach((singleEntry) => {
                    if (prevPos.y > singleEntry.boundingClientRect.y) {
                        scrollDirection.vertical = 'up';
                    }
                    else {
                        scrollDirection.vertical = 'down';
                    }
                    if (prevPos.x > singleEntry.boundingClientRect.x) {
                        scrollDirection.horizontal = 'left';
                    }
                    else {
                        scrollDirection.horizontal = 'right';
                    }
                    prevPos = {
                        y: singleEntry.boundingClientRect.y,
                        x: singleEntry.boundingClientRect.x,
                    };
                    const detail = {
                        inView: singleEntry.isIntersecting,
                        entry: singleEntry,
                        scrollDirection,
                        node,
                        observer: _observer,
                    };
                    node.dispatchEvent(createEvent('change', detail));
                    if (singleEntry.isIntersecting) {
                        node.dispatchEvent(createEvent('enter', detail));
                        unobserveOnEnter && _observer.unobserve(node);
                    }
                    else {
                        node.dispatchEvent(createEvent('leave', detail));
                    }
                });
            }, {
                root,
                rootMargin,
                threshold,
            });
            tick().then(() => {
                node.dispatchEvent(createEvent('init', { observer, node }));
            });
            observer.observe(node);
            return {
                destroy() {
                    observer.unobserve(node);
                },
            };
        }
    }

    /* node_modules\svelte-countup\src\Component.svelte generated by Svelte v3.59.1 */
    const file$6 = "node_modules\\svelte-countup\\src\\Component.svelte";

    function create_fragment$6(ctx) {
    	let span;
    	let t_value = /*formatNumber*/ ctx[3](/*counterResult*/ ctx[1][/*id*/ ctx[2]]) + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$6, 43, 0, 914);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(inview.call(null, span)),
    					listen_dev(span, "change", /*change_handler*/ ctx[10], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*counterResult*/ 2 && t_value !== (t_value = /*formatNumber*/ ctx[3](/*counterResult*/ ctx[1][/*id*/ ctx[2]]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all$1(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Component', slots, []);
    	const id = nanoid();
    	let isInView;
    	let { value } = $$props;
    	let { initial = 0 } = $$props;
    	let { duration = 3000 } = $$props;
    	let { step = 1 } = $$props;
    	let { roundto = 1 } = $$props;
    	let { format = true } = $$props;

    	function formatNumber(input) {
    		if (format) {
    			return Math.round(input).toLocaleString();
    		}

    		return input;
    	}

    	const counterResult = [];
    	const timers = [];
    	const max = parseInt(value);

    	while (duration / ((max - initial) / step) < 2) {
    		step++;
    	}

    	counterResult[id] = initial;

    	timers[id] = setInterval(
    		() => {
    			if (isInView) {
    				if (counterResult[id] <= max) {
    					$$invalidate(1, counterResult[id] += step, counterResult);
    				} else {
    					clearInterval(timers[id]);
    					$$invalidate(1, counterResult[id] = Math.round(max / roundto) * roundto, counterResult);
    				}
    			}
    		},
    		duration / ((max - initial) / step)
    	);

    	$$self.$$.on_mount.push(function () {
    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<Component> was created without expected prop 'value'");
    		}
    	});

    	const writable_props = ['value', 'initial', 'duration', 'step', 'roundto', 'format'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Component> was created with unknown prop '${key}'`);
    	});

    	const change_handler = event => {
    		const { inView } = event.detail;
    		$$invalidate(0, isInView = inView);
    	};

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(5, value = $$props.value);
    		if ('initial' in $$props) $$invalidate(6, initial = $$props.initial);
    		if ('duration' in $$props) $$invalidate(7, duration = $$props.duration);
    		if ('step' in $$props) $$invalidate(4, step = $$props.step);
    		if ('roundto' in $$props) $$invalidate(8, roundto = $$props.roundto);
    		if ('format' in $$props) $$invalidate(9, format = $$props.format);
    	};

    	$$self.$capture_state = () => ({
    		nanoid,
    		inview,
    		id,
    		isInView,
    		value,
    		initial,
    		duration,
    		step,
    		roundto,
    		format,
    		formatNumber,
    		counterResult,
    		timers,
    		max
    	});

    	$$self.$inject_state = $$props => {
    		if ('isInView' in $$props) $$invalidate(0, isInView = $$props.isInView);
    		if ('value' in $$props) $$invalidate(5, value = $$props.value);
    		if ('initial' in $$props) $$invalidate(6, initial = $$props.initial);
    		if ('duration' in $$props) $$invalidate(7, duration = $$props.duration);
    		if ('step' in $$props) $$invalidate(4, step = $$props.step);
    		if ('roundto' in $$props) $$invalidate(8, roundto = $$props.roundto);
    		if ('format' in $$props) $$invalidate(9, format = $$props.format);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isInView,
    		counterResult,
    		id,
    		formatNumber,
    		step,
    		value,
    		initial,
    		duration,
    		roundto,
    		format,
    		change_handler
    	];
    }

    class Component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			value: 5,
    			initial: 6,
    			duration: 7,
    			step: 4,
    			roundto: 8,
    			format: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Component",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get value() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initial() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initial(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get roundto() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set roundto(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Play.svelte generated by Svelte v3.59.1 */

    const { console: console_1$2 } = globals;
    const file$5 = "src\\pages\\Play.svelte";

    // (281:26) 
    function create_if_block_3(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "loader svelte-4mha69");
    			add_location(div0, file$5, 282, 10, 8237);
    			attr_dev(div1, "class", "loader-container svelte-4mha69");
    			add_location(div1, file$5, 281, 8, 8195);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(281:26) ",
    		ctx
    	});

    	return block;
    }

    // (236:80) 
    function create_if_block_1$1(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*questions*/ ctx[0][/*currentQuestionIndex*/ ctx[2]].questionText + "";
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (!/*showNextButton*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(h2, "class", "svelte-4mha69");
    			add_location(h2, file$5, 237, 10, 6736);
    			attr_dev(div, "class", "question-box svelte-4mha69");
    			add_location(div, file$5, 236, 8, 6698);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*questions, currentQuestionIndex*/ 5) && t0_value !== (t0_value = /*questions*/ ctx[0][/*currentQuestionIndex*/ ctx[2]].questionText + "")) set_data_dev(t0, t0_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(236:80) ",
    		ctx
    	});

    	return block;
    }

    // (229:6) {#if levelCompleted}
    function create_if_block$3(ctx) {
    	let h2;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let t6_value = /*stopTimer*/ ctx[10]() + "";
    	let t6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Level Completed!";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Home";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Leaderboard";
    			t5 = space();
    			t6 = text(t6_value);
    			attr_dev(h2, "class", "svelte-4mha69");
    			add_location(h2, file$5, 229, 8, 6360);
    			attr_dev(button0, "class", "btn btn-primary svelte-4mha69");
    			add_location(button0, file$5, 230, 8, 6395);
    			attr_dev(button1, "class", "btn btn-primary svelte-4mha69");
    			add_location(button1, file$5, 231, 8, 6476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, t6, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", redirectToHome, false, false, false, false),
    					listen_dev(button1, "click", redirectToLeaderboard, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(t6);
    			mounted = false;
    			run_all$1(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(229:6) {#if levelCompleted}",
    		ctx
    	});

    	return block;
    }

    // (258:8) {:else}
    function create_else_block$1(ctx) {
    	let div2;
    	let p0;
    	let t0;
    	let t1;
    	let t2;
    	let p1;
    	let t4;
    	let div0;
    	let countup;
    	let t5;
    	let t6;
    	let p2;
    	let t8;
    	let div1;
    	let t9;
    	let t10;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	countup = new Component({
    			props: {
    				initial: 0,
    				value: /*questionScore*/ ctx[7],
    				duration: 1000,
    				step: 1,
    				roundto: 1,
    				format: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			p0 = element("p");
    			t0 = text("The correct answer was: ");
    			t1 = text(/*correctAnswer*/ ctx[4]);
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "You gained:";
    			t4 = space();
    			div0 = element("div");
    			create_component(countup.$$.fragment);
    			t5 = text(" Points");
    			t6 = space();
    			p2 = element("p");
    			p2.textContent = "Your Highscore now is:";
    			t8 = space();
    			div1 = element("div");
    			t9 = text(/*score*/ ctx[6]);
    			t10 = space();
    			button = element("button");
    			button.textContent = "Next";
    			add_location(p0, file$5, 259, 12, 7511);
    			add_location(p1, file$5, 260, 12, 7571);
    			attr_dev(div0, "class", "question-score svelte-4mha69");
    			add_location(div0, file$5, 261, 12, 7604);
    			add_location(p2, file$5, 271, 12, 7902);
    			attr_dev(div1, "class", "highscore svelte-4mha69");
    			add_location(div1, file$5, 272, 12, 7945);
    			attr_dev(div2, "class", "answerClass svelte-4mha69");
    			add_location(div2, file$5, 258, 10, 7472);
    			attr_dev(button, "class", "btn btn-primary svelte-4mha69");
    			add_location(button, file$5, 276, 10, 8041);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, p1);
    			append_dev(div2, t4);
    			append_dev(div2, div0);
    			mount_component(countup, div0, null);
    			append_dev(div0, t5);
    			append_dev(div2, t6);
    			append_dev(div2, p2);
    			append_dev(div2, t8);
    			append_dev(div2, div1);
    			append_dev(div1, t9);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleNextQuestion*/ ctx[11], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*correctAnswer*/ 16) set_data_dev(t1, /*correctAnswer*/ ctx[4]);
    			const countup_changes = {};
    			if (dirty & /*questionScore*/ 128) countup_changes.value = /*questionScore*/ ctx[7];
    			countup.$set(countup_changes);
    			if (!current || dirty & /*score*/ 64) set_data_dev(t9, /*score*/ ctx[6]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(countup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(countup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(countup);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(258:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (241:8) {#if !showNextButton}
    function create_if_block_2$1(ctx) {
    	let form;
    	let div;
    	let input;
    	let t0;
    	let p;
    	let t2;
    	let h2;
    	let t3;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Time remaining:";
    			t2 = space();
    			h2 = element("h2");
    			t3 = text(/*timer*/ ctx[8]);
    			t4 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", "Enter your answer here");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "step", "1");
    			add_location(input, file$5, 244, 14, 6994);
    			add_location(p, file$5, 252, 14, 7249);
    			attr_dev(h2, "class", "svelte-4mha69");
    			add_location(h2, file$5, 253, 14, 7287);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary svelte-4mha69");
    			add_location(button, file$5, 254, 14, 7319);
    			attr_dev(div, "class", "form-group answer-input svelte-4mha69");
    			add_location(div, file$5, 243, 12, 6941);
    			attr_dev(form, "class", "svelte-4mha69");
    			add_location(form, file$5, 242, 12, 6921);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div);
    			append_dev(div, input);
    			set_input_value(input, /*userAnswer*/ ctx[1]);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(div, t2);
    			append_dev(div, h2);
    			append_dev(h2, t3);
    			append_dev(div, t4);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[13]),
    					listen_dev(button, "click", /*handleSubmit*/ ctx[12], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userAnswer*/ 2 && to_number(input.value) !== /*userAnswer*/ ctx[1]) {
    				set_input_value(input, /*userAnswer*/ ctx[1]);
    			}

    			if (dirty & /*timer*/ 256) set_data_dev(t3, /*timer*/ ctx[8]);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all$1(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(241:8) {#if !showNextButton}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_1$1, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*levelCompleted*/ ctx[3]) return 0;
    		if (/*questions*/ ctx[0].length > 0 && /*currentQuestionIndex*/ ctx[2] < /*questions*/ ctx[0].length) return 1;
    		if (/*isLoading*/ ctx[9]) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "col-md-12 text-center");
    			add_location(div0, file$5, 227, 4, 6287);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$5, 226, 2, 6264);
    			attr_dev(div2, "class", "container svelte-4mha69");
    			add_location(div2, file$5, 225, 0, 6237);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getNextLevel(currentLevel) {
    	const levels = [
    		"LEVEL_1",
    		"LEVEL_2",
    		"LEVEL_3",
    		"LEVEL_4",
    		"LEVEL_5",
    		"LEVEL_6",
    		"LEVEL_7",
    		"COMPLETED"
    	];

    	const currentIndex = levels.indexOf(currentLevel);
    	return levels[currentIndex + 1];
    }

    function redirectToLeaderboard() {
    	window.location.assign("#/leaderboards");
    }

    function redirectToHome() {
    	window.location.assign("#/home");
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $jwt_token;
    	validate_store(jwt_token, 'jwt_token');
    	component_subscribe($$self, jwt_token, $$value => $$invalidate(19, $jwt_token = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Play', slots, []);
    	let allQuestions = []; // Array to store all questions
    	let questions = []; // Array to store filtered questions
    	let userAnswer = "";
    	let playerDetails;
    	let playerLevel;
    	let currentQuestionIndex = 0;
    	let levelCompleted = false;
    	let playerId;
    	let correctAnswer = null;
    	let showNextButton = false;
    	let score = 0;
    	let questionScore = 0;
    	let countdown;
    	let timer = 60;
    	let isLoading = true;
    	const api_root = window.location.origin;

    	onMount(async () => {
    		try {
    			await getPlayerDetails();
    			await getQuestions();
    		} catch(error) {
    			console.error("Failed to fetch data:", error);
    		}
    	});

    	async function getPlayerDetails() {
    		var config = {
    			method: "get",
    			url: api_root + "/api/me/player",
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		try {
    			const response = await axios$1(config);
    			playerDetails = response.data;
    			playerLevel = response.data.playerLevelState;
    			playerId = response.data.id;
    			console.log("playerDetails:", playerDetails);
    		} catch(error) {
    			alert("Could not get Player associated to current user");
    			console.log(error);
    		}
    	}

    	async function getQuestions() {
    		var config = {
    			method: "get",
    			url: api_root + "/api/question",
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		try {
    			const response = await axios$1(config);
    			allQuestions = response.data;

    			// Handle the case when answeredQuestions is null
    			const answeredQuestionIds = playerDetails.answeredQuestions
    			? playerDetails.answeredQuestions.map(q => q.questionId)
    			: [];

    			$$invalidate(0, questions = allQuestions.filter(question => question.level === playerLevel).filter(question => !answeredQuestionIds.includes(question.id)));

    			//console.log
    			console.log("Answered question IDs:", answeredQuestionIds);

    			console.log("Player level:", playerLevel);
    			console.log("All questions:", allQuestions);
    			console.log("Filtered questions for level", playerLevel, ":", questions);
    			$$invalidate(9, isLoading = false);
    			stopTimer();
    			startTimer();
    		} catch(error) {
    			alert("Could not get questions");
    			console.log(error);
    		}
    	}

    	function startTimer() {
    		countdown = setInterval(
    			() => {
    				$$invalidate(8, timer--, timer);

    				if (timer <= 0) {
    					stopTimer();
    					console.log("handleTimer");
    				} //handleSubmit();
    			},
    			1000
    		);
    	}

    	function restartTimer() {
    		clearInterval(countdown); // Clear the previous timer
    		$$invalidate(8, timer = 60);
    		startTimer(); // Restart the timer
    	}

    	function stopTimer() {
    		clearInterval(countdown); // Clear the timer using countdown --> delets timer id
    	}

    	function handleNextQuestion() {
    		stopTimer(); // Stop the current timer
    		$$invalidate(1, userAnswer = ""); // clear the input
    		$$invalidate(5, showNextButton = false);
    		$$invalidate(4, correctAnswer = null);
    		$$invalidate(2, currentQuestionIndex++, currentQuestionIndex); // move to the next question
    		console.log("currentQuestionIndex:" + currentQuestionIndex);

    		// If the player has answered all the questions, update the level
    		if (currentQuestionIndex >= questions.length) {
    			$$invalidate(3, levelCompleted = true);
    			$$invalidate(2, currentQuestionIndex = 0);
    			updatePlayerLevel();
    		} else {
    			restartTimer(); // Reset timer to 60 and start a new timer
    		}
    	}

    	async function handleSubmit() {
    		const scores = await submitAnswer();
    		console.log("QuestionScore: " + score);
    		$$invalidate(6, score = scores.score);
    		$$invalidate(7, questionScore = scores.questionScore);
    		$$invalidate(4, correctAnswer = questions[currentQuestionIndex].correctAnswer);
    		$$invalidate(5, showNextButton = true);
    	}

    	async function submitAnswer() {
    		const config = {
    			method: "post",
    			url: `${api_root}/api/player/answer`,
    			headers: {
    				"Player-Id": playerDetails.id,
    				Authorization: `Bearer ${$jwt_token}`,
    				"Content-Type": "application/json"
    			},
    			data: {
    				questionId: questions[currentQuestionIndex].id,
    				playerAnswer: userAnswer
    			}
    		};

    		try {
    			const response = await axios$1(config);
    			playerDetails = response.data;
    			$$invalidate(1, userAnswer = "");
    			const answeredQuestions = response.data.answeredQuestions;

    			if (answeredQuestions && answeredQuestions.length > 0) {
    				$$invalidate(7, questionScore = answeredQuestions[answeredQuestions.length - 1].questionScore);
    			} else {
    				$$invalidate(7, questionScore = 0); // Default value when there are no answered questions
    			}

    			return {
    				score: response.data.score,
    				questionScore
    			};
    		} catch(error) {
    			console.error("Failed to submit answer:", error);
    		}
    	}

    	async function updatePlayerLevel() {
    		const playerLeveStateDTO = {
    			level: getNextLevel(playerLevel), // Update the player's level
    			
    		};

    		const config = {
    			method: "put",
    			url: `${api_root}/api/player/levelstate`,
    			headers: {
    				"Player-Id": playerId,
    				Authorization: `Bearer ${$jwt_token}`,
    				"Content-Type": "application/json"
    			},
    			data: playerLeveStateDTO
    		};

    		try {
    			const response = await axios$1(config);
    			playerDetails = response.data; // Update playerDetails with the updated player returned from the server
    			playerLevel = playerDetails.playerLevelState; // Update the player's level in our local state
    		} catch(error) {
    			console.error("Failed to update player level:", error);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Play> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		userAnswer = to_number(this.value);
    		$$invalidate(1, userAnswer);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		jwt_token,
    		axios: axios$1,
    		Countup: Component,
    		allQuestions,
    		questions,
    		userAnswer,
    		playerDetails,
    		playerLevel,
    		currentQuestionIndex,
    		levelCompleted,
    		playerId,
    		correctAnswer,
    		showNextButton,
    		score,
    		questionScore,
    		countdown,
    		timer,
    		isLoading,
    		api_root,
    		getPlayerDetails,
    		getQuestions,
    		startTimer,
    		restartTimer,
    		stopTimer,
    		handleNextQuestion,
    		handleSubmit,
    		submitAnswer,
    		updatePlayerLevel,
    		getNextLevel,
    		redirectToLeaderboard,
    		redirectToHome,
    		$jwt_token
    	});

    	$$self.$inject_state = $$props => {
    		if ('allQuestions' in $$props) allQuestions = $$props.allQuestions;
    		if ('questions' in $$props) $$invalidate(0, questions = $$props.questions);
    		if ('userAnswer' in $$props) $$invalidate(1, userAnswer = $$props.userAnswer);
    		if ('playerDetails' in $$props) playerDetails = $$props.playerDetails;
    		if ('playerLevel' in $$props) playerLevel = $$props.playerLevel;
    		if ('currentQuestionIndex' in $$props) $$invalidate(2, currentQuestionIndex = $$props.currentQuestionIndex);
    		if ('levelCompleted' in $$props) $$invalidate(3, levelCompleted = $$props.levelCompleted);
    		if ('playerId' in $$props) playerId = $$props.playerId;
    		if ('correctAnswer' in $$props) $$invalidate(4, correctAnswer = $$props.correctAnswer);
    		if ('showNextButton' in $$props) $$invalidate(5, showNextButton = $$props.showNextButton);
    		if ('score' in $$props) $$invalidate(6, score = $$props.score);
    		if ('questionScore' in $$props) $$invalidate(7, questionScore = $$props.questionScore);
    		if ('countdown' in $$props) countdown = $$props.countdown;
    		if ('timer' in $$props) $$invalidate(8, timer = $$props.timer);
    		if ('isLoading' in $$props) $$invalidate(9, isLoading = $$props.isLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		questions,
    		userAnswer,
    		currentQuestionIndex,
    		levelCompleted,
    		correctAnswer,
    		showNextButton,
    		score,
    		questionScore,
    		timer,
    		isLoading,
    		stopTimer,
    		handleNextQuestion,
    		handleSubmit,
    		input_input_handler
    	];
    }

    class Play extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Play",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\pages\Players.svelte generated by Svelte v3.59.1 */

    const { console: console_1$1 } = globals;
    const file$4 = "src\\pages\\Players.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (132:8) {#each players as player}
    function create_each_block_1$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*player*/ ctx[3].username + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*player*/ ctx[3].email + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*player*/ ctx[3].playerLevelState + "";
    	let t4;
    	let t5;
    	let button;
    	let t7;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[9](/*player*/ ctx[3]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			button = element("button");
    			button.textContent = "Delete";
    			t7 = space();
    			add_location(td0, file$4, 133, 16, 3543);
    			add_location(td1, file$4, 134, 16, 3587);
    			add_location(td2, file$4, 135, 16, 3628);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-danger");
    			add_location(button, file$4, 136, 16, 3680);
    			add_location(tr, file$4, 132, 12, 3521);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, button);
    			append_dev(tr, t7);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*players*/ 4 && t0_value !== (t0_value = /*player*/ ctx[3].username + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*players*/ 4 && t2_value !== (t2_value = /*player*/ ctx[3].email + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*players*/ 4 && t4_value !== (t4_value = /*player*/ ctx[3].playerLevelState + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(132:8) {#each players as player}",
    		ctx
    	});

    	return block;
    }

    // (144:8) {#each Array(nrOfPages) as _, i}
    function create_each_block$2(ctx) {
    	let li;
    	let a;
    	let t0_value = /*i*/ ctx[16] + 1 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "page-link");
    			attr_dev(a, "href", "#/players?page=" + (/*i*/ ctx[16] + 1));
    			toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[16] + 1);
    			add_location(a, file$4, 145, 16, 3973);
    			attr_dev(li, "class", "page-item");
    			add_location(li, file$4, 144, 12, 3933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentPage*/ 1) {
    				toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[16] + 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(144:8) {#each Array(nrOfPages) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let h10;
    	let t1;
    	let form;
    	let div1;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div3;
    	let div2;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let button;
    	let t9;
    	let h11;
    	let t11;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t13;
    	let th1;
    	let t15;
    	let th2;
    	let t17;
    	let tbody;
    	let t18;
    	let nav;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*players*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = Array(/*nrOfPages*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h10 = element("h1");
    			h10.textContent = "Create Player";
    			t1 = space();
    			form = element("form");
    			div1 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Username";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "E-Mail";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			t9 = space();
    			h11 = element("h1");
    			h11.textContent = "All Players";
    			t11 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t13 = space();
    			th1 = element("th");
    			th1.textContent = "E-Mail";
    			t15 = space();
    			th2 = element("th");
    			th2.textContent = "Current Level";
    			t17 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t18 = space();
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h10, "class", "mt-3");
    			add_location(h10, file$4, 94, 0, 2418);
    			attr_dev(label0, "class", "form-label");
    			attr_dev(label0, "for", "name");
    			add_location(label0, file$4, 98, 12, 2543);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "username");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$4, 99, 12, 2610);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$4, 97, 8, 2512);
    			attr_dev(div1, "class", "row mb-3");
    			add_location(div1, file$4, 96, 4, 2480);
    			attr_dev(label1, "class", "form-label");
    			attr_dev(label1, "for", "email");
    			add_location(label1, file$4, 109, 12, 2873);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "type", "email");
    			add_location(input1, file$4, 110, 12, 2939);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$4, 108, 8, 2842);
    			attr_dev(div3, "class", "row mb-3");
    			add_location(div3, file$4, 107, 4, 2810);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$4, 118, 4, 3134);
    			attr_dev(form, "class", "mb-5");
    			add_location(form, file$4, 95, 0, 2455);
    			add_location(h11, file$4, 121, 0, 3232);
    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$4, 125, 12, 3316);
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$4, 126, 12, 3355);
    			attr_dev(th2, "scope", "col");
    			add_location(th2, file$4, 127, 12, 3396);
    			add_location(tr, file$4, 124, 8, 3298);
    			add_location(thead, file$4, 123, 4, 3281);
    			add_location(tbody, file$4, 130, 4, 3465);
    			attr_dev(table, "class", "table");
    			add_location(table, file$4, 122, 0, 3254);
    			attr_dev(ul, "class", "pagination");
    			add_location(ul, file$4, 142, 4, 3854);
    			add_location(nav, file$4, 141, 0, 3843);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*player*/ ctx[3].username);
    			append_dev(form, t4);
    			append_dev(form, div3);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t6);
    			append_dev(div2, input1);
    			set_input_value(input1, /*player*/ ctx[3].email);
    			append_dev(form, t7);
    			append_dev(form, button);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t13);
    			append_dev(tr, th1);
    			append_dev(tr, t15);
    			append_dev(tr, th2);
    			append_dev(table, t17);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(tbody, null);
    				}
    			}

    			insert_dev(target, t18, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(button, "click", /*createPlayer*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*player*/ 8 && input0.value !== /*player*/ ctx[3].username) {
    				set_input_value(input0, /*player*/ ctx[3].username);
    			}

    			if (dirty & /*player*/ 8 && input1.value !== /*player*/ ctx[3].email) {
    				set_input_value(input1, /*player*/ ctx[3].email);
    			}

    			if (dirty & /*deletePlayer, players*/ 36) {
    				each_value_1 = /*players*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*currentPage, nrOfPages*/ 3) {
    				each_value = Array(/*nrOfPages*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all$1(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $jwt_token;
    	let $querystring;
    	validate_store(jwt_token, 'jwt_token');
    	component_subscribe($$self, jwt_token, $$value => $$invalidate(10, $jwt_token = $$value));
    	validate_store(querystring, 'querystring');
    	component_subscribe($$self, querystring, $$value => $$invalidate(6, $querystring = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Players', slots, []);
    	const api_root = window.location.origin;
    	let currentPage;
    	let nrOfPages = 0;
    	let defaultPageSize = 4;
    	let players = [];
    	let player = { id: null, email: null, username: null };

    	function getPlayer() {
    		let query = "?pageSize=" + defaultPageSize + "&pageNumber=" + currentPage;

    		var config = {
    			method: "get",
    			url: api_root + "/api/player" + query,
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios$1(config).then(function (response) {
    			$$invalidate(2, players = response.data.content);
    			$$invalidate(1, nrOfPages = response.data.totalPages);
    		}).catch(function (error) {
    			alert("Could not get players");
    			console.log(error);
    		});
    	}

    	function createPlayer() {
    		var config = {
    			method: "post",
    			url: api_root + "/api/player",
    			headers: {
    				"Content-Type": "application/json",
    				Authorization: "Bearer " + $jwt_token
    			},
    			data: player
    		};

    		axios$1(config).then(function (response) {
    			alert("Player created");
    			getPlayer();
    		}).catch(function (error) {
    			alert("Could not create Player");
    			console.log(error);
    		});
    	}

    	function deletePlayer(id) {
    		var config = {
    			method: "delete",
    			url: api_root + "/api/player/" + id,
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios$1(config).then(function (response) {
    			alert("Player deleted");
    			getPlayer();
    		}).catch(function (error) {
    			alert("Could not delete Player");
    			console.log(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Players> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		player.username = this.value;
    		$$invalidate(3, player);
    	}

    	function input1_input_handler() {
    		player.email = this.value;
    		$$invalidate(3, player);
    	}

    	const click_handler = player => deletePlayer(player.id);

    	$$self.$capture_state = () => ({
    		axios: axios$1,
    		querystring,
    		isAuthenticated,
    		user,
    		jwt_token,
    		api_root,
    		currentPage,
    		nrOfPages,
    		defaultPageSize,
    		players,
    		player,
    		getPlayer,
    		createPlayer,
    		deletePlayer,
    		$jwt_token,
    		$querystring
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('nrOfPages' in $$props) $$invalidate(1, nrOfPages = $$props.nrOfPages);
    		if ('defaultPageSize' in $$props) defaultPageSize = $$props.defaultPageSize;
    		if ('players' in $$props) $$invalidate(2, players = $$props.players);
    		if ('player' in $$props) $$invalidate(3, player = $$props.player);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$querystring*/ 64) {
    			{
    				let searchParams = new URLSearchParams($querystring);

    				if (searchParams.has("page")) {
    					$$invalidate(0, currentPage = searchParams.get("page"));
    				} else {
    					$$invalidate(0, currentPage = "1");
    				}

    				getPlayer();
    			}
    		}
    	};

    	return [
    		currentPage,
    		nrOfPages,
    		players,
    		player,
    		createPlayer,
    		deletePlayer,
    		$querystring,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler
    	];
    }

    class Players extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Players",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* node_modules\svelte-confetti\src\Confetti.svelte generated by Svelte v3.59.1 */
    const file$3 = "node_modules\\svelte-confetti\\src\\Confetti.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (41:0) {#if !complete}
    function create_if_block$2(ctx) {
    	let div;
    	let each_value = { length: /*amount*/ ctx[6] };
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "confetti-holder svelte-io58ff");
    			toggle_class(div, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(div, "cone", /*cone*/ ctx[10]);
    			toggle_class(div, "no-gravity", /*noGravity*/ ctx[11]);
    			add_location(div, file$3, 41, 2, 1104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fallDistance, size, getColor, randomBetween, y, x, infinite, duration, delay, iterationCount, xSpread, amount*/ 20991) {
    				each_value = { length: /*amount*/ ctx[6] };
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*rounded*/ 512) {
    				toggle_class(div, "rounded", /*rounded*/ ctx[9]);
    			}

    			if (dirty & /*cone*/ 1024) {
    				toggle_class(div, "cone", /*cone*/ ctx[10]);
    			}

    			if (dirty & /*noGravity*/ 2048) {
    				toggle_class(div, "no-gravity", /*noGravity*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:0) {#if !complete}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#each { length: amount } as _}
    function create_each_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "confetti svelte-io58ff");
    			set_style(div, "--fall-distance", /*fallDistance*/ ctx[8]);
    			set_style(div, "--size", /*size*/ ctx[0] + "px");
    			set_style(div, "--color", /*getColor*/ ctx[14]());
    			set_style(div, "--skew", randomBetween(-45, 45) + "deg," + randomBetween(-45, 45) + "deg");
    			set_style(div, "--rotation-xyz", randomBetween(-10, 10) + ", " + randomBetween(-10, 10) + ", " + randomBetween(-10, 10));
    			set_style(div, "--rotation-deg", randomBetween(0, 360) + "deg");
    			set_style(div, "--translate-y-multiplier", randomBetween(/*y*/ ctx[2][0], /*y*/ ctx[2][1]));
    			set_style(div, "--translate-x-multiplier", randomBetween(/*x*/ ctx[1][0], /*x*/ ctx[1][1]));
    			set_style(div, "--scale", 0.1 * randomBetween(2, 10));

    			set_style(div, "--transition-duration", /*infinite*/ ctx[4]
    			? `calc(${/*duration*/ ctx[3]}ms * var(--scale))`
    			: `${/*duration*/ ctx[3]}ms`);

    			set_style(div, "--transition-delay", randomBetween(/*delay*/ ctx[5][0], /*delay*/ ctx[5][1]) + "ms");

    			set_style(div, "--transition-iteration-count", /*infinite*/ ctx[4]
    			? 'infinite'
    			: /*iterationCount*/ ctx[7]);

    			set_style(div, "--x-spread", 1 - /*xSpread*/ ctx[12]);
    			add_location(div, file$3, 43, 6, 1232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fallDistance*/ 256) {
    				set_style(div, "--fall-distance", /*fallDistance*/ ctx[8]);
    			}

    			if (dirty & /*size*/ 1) {
    				set_style(div, "--size", /*size*/ ctx[0] + "px");
    			}

    			if (dirty & /*y*/ 4) {
    				set_style(div, "--translate-y-multiplier", randomBetween(/*y*/ ctx[2][0], /*y*/ ctx[2][1]));
    			}

    			if (dirty & /*x*/ 2) {
    				set_style(div, "--translate-x-multiplier", randomBetween(/*x*/ ctx[1][0], /*x*/ ctx[1][1]));
    			}

    			if (dirty & /*infinite, duration*/ 24) {
    				set_style(div, "--transition-duration", /*infinite*/ ctx[4]
    				? `calc(${/*duration*/ ctx[3]}ms * var(--scale))`
    				: `${/*duration*/ ctx[3]}ms`);
    			}

    			if (dirty & /*delay*/ 32) {
    				set_style(div, "--transition-delay", randomBetween(/*delay*/ ctx[5][0], /*delay*/ ctx[5][1]) + "ms");
    			}

    			if (dirty & /*infinite, iterationCount*/ 144) {
    				set_style(div, "--transition-iteration-count", /*infinite*/ ctx[4]
    				? 'infinite'
    				: /*iterationCount*/ ctx[7]);
    			}

    			if (dirty & /*xSpread*/ 4096) {
    				set_style(div, "--x-spread", 1 - /*xSpread*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(43:4) {#each { length: amount } as _}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = !/*complete*/ ctx[13] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*complete*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randomBetween(min, max) {
    	return Math.random() * (max - min) + min;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Confetti', slots, []);
    	let { size = 10 } = $$props;
    	let { x = [-0.5, 0.5] } = $$props;
    	let { y = [0.25, 1] } = $$props;
    	let { duration = 2000 } = $$props;
    	let { infinite = false } = $$props;
    	let { delay = [0, 50] } = $$props;
    	let { colorRange = [0, 360] } = $$props;
    	let { colorArray = [] } = $$props;
    	let { amount = 50 } = $$props;
    	let { iterationCount = 1 } = $$props;
    	let { fallDistance = "100px" } = $$props;
    	let { rounded = false } = $$props;
    	let { cone = false } = $$props;
    	let { noGravity = false } = $$props;
    	let { xSpread = 0.15 } = $$props;
    	let { destroyOnComplete = true } = $$props;
    	let complete = false;

    	onMount(() => {
    		if (!destroyOnComplete || infinite || iterationCount == "infinite") return;
    		setTimeout(() => $$invalidate(13, complete = true), (duration + delay[1]) * iterationCount);
    	});

    	function getColor() {
    		if (colorArray.length) return colorArray[Math.round(Math.random() * (colorArray.length - 1))]; else return `hsl(${Math.round(randomBetween(colorRange[0], colorRange[1]))}, 75%, 50%`;
    	}

    	const writable_props = [
    		'size',
    		'x',
    		'y',
    		'duration',
    		'infinite',
    		'delay',
    		'colorRange',
    		'colorArray',
    		'amount',
    		'iterationCount',
    		'fallDistance',
    		'rounded',
    		'cone',
    		'noGravity',
    		'xSpread',
    		'destroyOnComplete'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Confetti> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('x' in $$props) $$invalidate(1, x = $$props.x);
    		if ('y' in $$props) $$invalidate(2, y = $$props.y);
    		if ('duration' in $$props) $$invalidate(3, duration = $$props.duration);
    		if ('infinite' in $$props) $$invalidate(4, infinite = $$props.infinite);
    		if ('delay' in $$props) $$invalidate(5, delay = $$props.delay);
    		if ('colorRange' in $$props) $$invalidate(15, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(16, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    		if ('noGravity' in $$props) $$invalidate(11, noGravity = $$props.noGravity);
    		if ('xSpread' in $$props) $$invalidate(12, xSpread = $$props.xSpread);
    		if ('destroyOnComplete' in $$props) $$invalidate(17, destroyOnComplete = $$props.destroyOnComplete);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		size,
    		x,
    		y,
    		duration,
    		infinite,
    		delay,
    		colorRange,
    		colorArray,
    		amount,
    		iterationCount,
    		fallDistance,
    		rounded,
    		cone,
    		noGravity,
    		xSpread,
    		destroyOnComplete,
    		complete,
    		randomBetween,
    		getColor
    	});

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('x' in $$props) $$invalidate(1, x = $$props.x);
    		if ('y' in $$props) $$invalidate(2, y = $$props.y);
    		if ('duration' in $$props) $$invalidate(3, duration = $$props.duration);
    		if ('infinite' in $$props) $$invalidate(4, infinite = $$props.infinite);
    		if ('delay' in $$props) $$invalidate(5, delay = $$props.delay);
    		if ('colorRange' in $$props) $$invalidate(15, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(16, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    		if ('noGravity' in $$props) $$invalidate(11, noGravity = $$props.noGravity);
    		if ('xSpread' in $$props) $$invalidate(12, xSpread = $$props.xSpread);
    		if ('destroyOnComplete' in $$props) $$invalidate(17, destroyOnComplete = $$props.destroyOnComplete);
    		if ('complete' in $$props) $$invalidate(13, complete = $$props.complete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		size,
    		x,
    		y,
    		duration,
    		infinite,
    		delay,
    		amount,
    		iterationCount,
    		fallDistance,
    		rounded,
    		cone,
    		noGravity,
    		xSpread,
    		complete,
    		getColor,
    		colorRange,
    		colorArray,
    		destroyOnComplete
    	];
    }

    class Confetti extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			size: 0,
    			x: 1,
    			y: 2,
    			duration: 3,
    			infinite: 4,
    			delay: 5,
    			colorRange: 15,
    			colorArray: 16,
    			amount: 6,
    			iterationCount: 7,
    			fallDistance: 8,
    			rounded: 9,
    			cone: 10,
    			noGravity: 11,
    			xSpread: 12,
    			destroyOnComplete: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Confetti",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get size() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get infinite() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set infinite(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delay() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delay(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorRange() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorRange(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorArray() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorArray(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iterationCount() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iterationCount(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallDistance() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallDistance(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cone() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cone(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGravity() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGravity(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xSpread() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xSpread(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get destroyOnComplete() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set destroyOnComplete(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Leaderboard.svelte generated by Svelte v3.59.1 */

    const { console: console_1 } = globals;
    const file$2 = "src\\pages\\Leaderboard.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (155:28) {#each completedPlayers as player, index}
    function create_each_block_1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*index*/ ctx[7] + 1 + "";
    	let t0;
    	let t1;
    	let td1;
    	let img;
    	let img_src_value;
    	let t2;
    	let td2;
    	let t3_value = /*player*/ ctx[5].username + "";
    	let t3;
    	let t4;
    	let td3;
    	let t5_value = /*player*/ ctx[5].score + "";
    	let t5;
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*player*/ ctx[5].averageDeviation + "";
    	let t8;
    	let t9;
    	let t10;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			img = element("img");
    			t2 = space();
    			td2 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			td3 = element("td");
    			t5 = text(t5_value);
    			t6 = text(" Points");
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = text("%");
    			t10 = space();
    			attr_dev(td0, "class", "svelte-13uk91g");
    			add_location(td0, file$2, 156, 36, 4628);
    			attr_dev(img, "class", "robohash-img");
    			attr_dev(img, "alt", "robohash");
    			if (!src_url_equal(img.src, img_src_value = /*player*/ ctx[5].roboHashUrl)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "50");
    			attr_dev(img, "height", "50");
    			add_location(img, file$2, 158, 40, 4732);
    			attr_dev(td1, "class", "svelte-13uk91g");
    			add_location(td1, file$2, 157, 36, 4686);
    			attr_dev(td2, "class", "svelte-13uk91g");
    			add_location(td2, file$2, 166, 36, 5170);
    			attr_dev(td3, "class", "svelte-13uk91g");
    			add_location(td3, file$2, 167, 36, 5234);
    			attr_dev(td4, "class", "svelte-13uk91g");
    			add_location(td4, file$2, 168, 36, 5302);
    			add_location(tr, file$2, 155, 32, 4586);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, img);
    			append_dev(tr, t2);
    			append_dev(tr, td2);
    			append_dev(td2, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td3);
    			append_dev(td3, t5);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(td4, t9);
    			append_dev(tr, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*completedPlayers*/ 1 && !src_url_equal(img.src, img_src_value = /*player*/ ctx[5].roboHashUrl)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*completedPlayers*/ 1 && t3_value !== (t3_value = /*player*/ ctx[5].username + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*completedPlayers*/ 1 && t5_value !== (t5_value = /*player*/ ctx[5].score + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*completedPlayers*/ 1 && t8_value !== (t8_value = /*player*/ ctx[5].averageDeviation + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(155:28) {#each completedPlayers as player, index}",
    		ctx
    	});

    	return block;
    }

    // (193:28) {#each notCompletedPlayers as player, index}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*index*/ ctx[7] + 1 + "";
    	let t0;
    	let t1;
    	let td1;
    	let img;
    	let img_src_value;
    	let t2;
    	let td2;
    	let t3_value = /*player*/ ctx[5].username + "";
    	let t3;
    	let t4;
    	let td3;
    	let t5_value = /*player*/ ctx[5].score + "";
    	let t5;
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*player*/ ctx[5].playerLevelState + "";
    	let t8;
    	let t9;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			img = element("img");
    			t2 = space();
    			td2 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			td3 = element("td");
    			t5 = text(t5_value);
    			t6 = text(" Points");
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			attr_dev(td0, "class", "svelte-13uk91g");
    			add_location(td0, file$2, 194, 36, 6462);
    			attr_dev(img, "class", "robohash-img");
    			attr_dev(img, "alt", "robohash");
    			if (!src_url_equal(img.src, img_src_value = /*player*/ ctx[5].roboHashUrl)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "50");
    			attr_dev(img, "height", "50");
    			add_location(img, file$2, 196, 40, 6566);
    			attr_dev(td1, "class", "svelte-13uk91g");
    			add_location(td1, file$2, 195, 36, 6520);
    			attr_dev(td2, "class", "svelte-13uk91g");
    			add_location(td2, file$2, 204, 36, 7004);
    			attr_dev(td3, "class", "svelte-13uk91g");
    			add_location(td3, file$2, 205, 36, 7068);
    			attr_dev(td4, "class", "svelte-13uk91g");
    			add_location(td4, file$2, 206, 36, 7136);
    			add_location(tr, file$2, 193, 32, 6420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, img);
    			append_dev(tr, t2);
    			append_dev(tr, td2);
    			append_dev(td2, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td3);
    			append_dev(td3, t5);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notCompletedPlayers*/ 2 && !src_url_equal(img.src, img_src_value = /*player*/ ctx[5].roboHashUrl)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*notCompletedPlayers*/ 2 && t3_value !== (t3_value = /*player*/ ctx[5].username + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*notCompletedPlayers*/ 2 && t5_value !== (t5_value = /*player*/ ctx[5].score + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*notCompletedPlayers*/ 2 && t8_value !== (t8_value = /*player*/ ctx[5].playerLevelState + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(193:28) {#each notCompletedPlayers as player, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div0;
    	let confetti0;
    	let t0;
    	let div1;
    	let confetti1;
    	let t1;
    	let div7;
    	let div6;
    	let div5;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let h20;
    	let t4;
    	let p0;
    	let t5_value = /*completedPlayers*/ ctx[0][1]?.username + "";
    	let t5;
    	let t6;
    	let t7_value = /*completedPlayers*/ ctx[0][1]?.score + "";
    	let t7;
    	let t8;
    	let t9;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let h21;
    	let t12;
    	let p1;
    	let t13_value = /*completedPlayers*/ ctx[0][0]?.username + "";
    	let t13;
    	let t14;
    	let t15_value = /*completedPlayers*/ ctx[0][0]?.score + "";
    	let t15;
    	let t16;
    	let t17;
    	let div4;
    	let img2;
    	let img2_src_value;
    	let t18;
    	let h22;
    	let t20;
    	let p2;
    	let t21_value = /*completedPlayers*/ ctx[0][2]?.username + "";
    	let t21;
    	let t22;
    	let t23_value = /*completedPlayers*/ ctx[0][2]?.score + "";
    	let t23;
    	let t24;
    	let t25;
    	let div15;
    	let div14;
    	let div10;
    	let div9;
    	let div8;
    	let h50;
    	let t27;
    	let table0;
    	let thead0;
    	let tr0;
    	let th0;
    	let t29;
    	let th1;
    	let t31;
    	let th2;
    	let t33;
    	let th3;
    	let t35;
    	let th4;
    	let t37;
    	let tbody0;
    	let t38;
    	let div13;
    	let div12;
    	let div11;
    	let h51;
    	let t40;
    	let table1;
    	let thead1;
    	let tr1;
    	let th5;
    	let t42;
    	let th6;
    	let t44;
    	let th7;
    	let t46;
    	let th8;
    	let t48;
    	let th9;
    	let t50;
    	let tbody1;
    	let current;

    	confetti0 = new Confetti({
    			props: {
    				x: [-5, 5],
    				y: [0, 0.1],
    				delay: [500, 2000],
    				infinite: true,
    				duration: "5000",
    				amount: "200",
    				fallDistance: "100vh"
    			},
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				x: [-5, 5],
    				y: [0, 0.1],
    				delay: [500, 2000],
    				infinite: true,
    				duration: "5000",
    				amount: "200",
    				fallDistance: "100vh"
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*completedPlayers*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*notCompletedPlayers*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(confetti0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(confetti1.$$.fragment);
    			t1 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div2 = element("div");
    			img0 = element("img");
    			t2 = space();
    			h20 = element("h2");
    			h20.textContent = "#2";
    			t4 = space();
    			p0 = element("p");
    			t5 = text(t5_value);
    			t6 = text(" - ");
    			t7 = text(t7_value);
    			t8 = text(" Points");
    			t9 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t10 = space();
    			h21 = element("h2");
    			h21.textContent = "#1";
    			t12 = space();
    			p1 = element("p");
    			t13 = text(t13_value);
    			t14 = text(" - ");
    			t15 = text(t15_value);
    			t16 = text(" Points");
    			t17 = space();
    			div4 = element("div");
    			img2 = element("img");
    			t18 = space();
    			h22 = element("h2");
    			h22.textContent = "#3";
    			t20 = space();
    			p2 = element("p");
    			t21 = text(t21_value);
    			t22 = text(" - ");
    			t23 = text(t23_value);
    			t24 = text(" Points");
    			t25 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Completed Players";
    			t27 = space();
    			table0 = element("table");
    			thead0 = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Rank";
    			t29 = space();
    			th1 = element("th");
    			th1.textContent = "Avatar";
    			t31 = space();
    			th2 = element("th");
    			th2.textContent = "Username";
    			t33 = space();
    			th3 = element("th");
    			th3.textContent = "Score";
    			t35 = space();
    			th4 = element("th");
    			th4.textContent = "Average Deviation";
    			t37 = space();
    			tbody0 = element("tbody");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t38 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Not Completed Players";
    			t40 = space();
    			table1 = element("table");
    			thead1 = element("thead");
    			tr1 = element("tr");
    			th5 = element("th");
    			th5.textContent = "Rank";
    			t42 = space();
    			th6 = element("th");
    			th6.textContent = "Avatar";
    			t44 = space();
    			th7 = element("th");
    			th7.textContent = "Username";
    			t46 = space();
    			th8 = element("th");
    			th8.textContent = "Score";
    			t48 = space();
    			th9 = element("th");
    			th9.textContent = "Current Level";
    			t50 = space();
    			tbody1 = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(div0, "position", "fixed");
    			set_style(div0, "top", "-50px");
    			set_style(div0, "left", "0");
    			set_style(div0, "height", "100vh");
    			set_style(div0, "width", "100vw");
    			set_style(div0, "display", "flex");
    			set_style(div0, "justify-content", "center");
    			set_style(div0, "overflow", "hidden");
    			set_style(div0, "pointer-events", "none");
    			add_location(div0, file$2, 39, 0, 1087);
    			set_style(div1, "position", "fixed");
    			set_style(div1, "top", "-50px");
    			set_style(div1, "left", "0");
    			set_style(div1, "height", "100vh");
    			set_style(div1, "width", "100vw");
    			set_style(div1, "display", "flex");
    			set_style(div1, "justify-content", "center");
    			set_style(div1, "overflow", "hidden");
    			set_style(div1, "pointer-events", "none");
    			add_location(div1, file$2, 62, 0, 1484);
    			attr_dev(img0, "class", "robohash-img");
    			attr_dev(img0, "alt", "robohash");
    			if (!src_url_equal(img0.src, img0_src_value = /*completedPlayers*/ ctx[0][1]?.roboHashUrl)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "150");
    			attr_dev(img0, "height", "150");
    			add_location(img0, file$2, 89, 16, 2058);
    			add_location(h20, file$2, 96, 16, 2305);
    			add_location(p0, file$2, 97, 16, 2334);
    			attr_dev(div2, "class", "text-center top-players svelte-13uk91g");
    			add_location(div2, file$2, 88, 12, 2003);
    			attr_dev(img1, "class", "robohash-img");
    			attr_dev(img1, "alt", "robohash");
    			if (!src_url_equal(img1.src, img1_src_value = /*completedPlayers*/ ctx[0][0]?.roboHashUrl)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "width", "200");
    			attr_dev(img1, "height", "200");
    			add_location(img1, file$2, 106, 16, 2655);
    			add_location(h21, file$2, 113, 16, 2902);
    			add_location(p1, file$2, 114, 16, 2931);
    			attr_dev(div3, "class", "text-center top-players svelte-13uk91g");
    			set_style(div3, "position", "relative");
    			set_style(div3, "bottom", "20px");
    			add_location(div3, file$2, 102, 12, 2510);
    			attr_dev(img2, "class", "robohash-img");
    			attr_dev(img2, "alt", "robohash");
    			if (!src_url_equal(img2.src, img2_src_value = /*completedPlayers*/ ctx[0][2]?.roboHashUrl)) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "width", "150");
    			attr_dev(img2, "height", "150");
    			add_location(img2, file$2, 120, 16, 3162);
    			add_location(h22, file$2, 127, 16, 3409);
    			add_location(p2, file$2, 128, 16, 3438);
    			attr_dev(div4, "class", "text-center top-players svelte-13uk91g");
    			add_location(div4, file$2, 119, 12, 3107);
    			attr_dev(div5, "class", "col d-flex justify-content-center");
    			add_location(div5, file$2, 87, 8, 1942);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$2, 86, 4, 1915);
    			attr_dev(div7, "class", "container mt-5");
    			add_location(div7, file$2, 85, 0, 1881);
    			attr_dev(h50, "class", "card-title");
    			add_location(h50, file$2, 142, 20, 3879);
    			attr_dev(th0, "scope", "col");
    			attr_dev(th0, "class", "svelte-13uk91g");
    			add_location(th0, file$2, 146, 32, 4098);
    			attr_dev(th1, "scope", "col");
    			attr_dev(th1, "class", "svelte-13uk91g");
    			add_location(th1, file$2, 147, 32, 4157);
    			attr_dev(th2, "scope", "col");
    			attr_dev(th2, "class", "svelte-13uk91g");
    			add_location(th2, file$2, 148, 32, 4218);
    			attr_dev(th3, "scope", "col");
    			attr_dev(th3, "class", "svelte-13uk91g");
    			add_location(th3, file$2, 149, 32, 4281);
    			attr_dev(th4, "scope", "col");
    			attr_dev(th4, "class", "svelte-13uk91g");
    			add_location(th4, file$2, 150, 32, 4341);
    			add_location(tr0, file$2, 145, 28, 4060);
    			add_location(thead0, file$2, 144, 24, 4023);
    			add_location(tbody0, file$2, 153, 24, 4474);
    			attr_dev(table0, "class", "table table-borderless custom-table svelte-13uk91g");
    			add_location(table0, file$2, 143, 20, 3946);
    			attr_dev(div8, "class", "card-body");
    			add_location(div8, file$2, 141, 16, 3834);
    			attr_dev(div9, "class", "card text-white bg-transparent border-light mb-3");
    			add_location(div9, file$2, 140, 12, 3754);
    			attr_dev(div10, "class", "col-lg-6");
    			add_location(div10, file$2, 139, 8, 3718);
    			attr_dev(h51, "class", "card-title");
    			add_location(h51, file$2, 180, 20, 5710);
    			attr_dev(th5, "scope", "col");
    			attr_dev(th5, "class", "svelte-13uk91g");
    			add_location(th5, file$2, 184, 32, 5933);
    			attr_dev(th6, "scope", "col");
    			attr_dev(th6, "class", "svelte-13uk91g");
    			add_location(th6, file$2, 185, 32, 5992);
    			attr_dev(th7, "scope", "col");
    			attr_dev(th7, "class", "svelte-13uk91g");
    			add_location(th7, file$2, 186, 32, 6053);
    			attr_dev(th8, "scope", "col");
    			attr_dev(th8, "class", "svelte-13uk91g");
    			add_location(th8, file$2, 187, 32, 6116);
    			attr_dev(th9, "scope", "col");
    			attr_dev(th9, "class", "svelte-13uk91g");
    			add_location(th9, file$2, 188, 32, 6176);
    			add_location(tr1, file$2, 183, 28, 5895);
    			add_location(thead1, file$2, 182, 24, 5858);
    			add_location(tbody1, file$2, 191, 24, 6305);
    			attr_dev(table1, "class", "table table-borderless custom-table svelte-13uk91g");
    			add_location(table1, file$2, 181, 20, 5781);
    			attr_dev(div11, "class", "card-body");
    			add_location(div11, file$2, 179, 16, 5665);
    			attr_dev(div12, "class", "card text-white bg-transparent border-light mb-3");
    			add_location(div12, file$2, 178, 12, 5585);
    			attr_dev(div13, "class", "col-lg-6");
    			add_location(div13, file$2, 177, 8, 5549);
    			attr_dev(div14, "class", "row");
    			add_location(div14, file$2, 138, 4, 3691);
    			attr_dev(div15, "class", "container leaderboard-container svelte-13uk91g");
    			add_location(div15, file$2, 137, 0, 3640);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(confetti0, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(confetti1, div1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t2);
    			append_dev(div2, h20);
    			append_dev(div2, t4);
    			append_dev(div2, p0);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(p0, t7);
    			append_dev(p0, t8);
    			append_dev(div5, t9);
    			append_dev(div5, div3);
    			append_dev(div3, img1);
    			append_dev(div3, t10);
    			append_dev(div3, h21);
    			append_dev(div3, t12);
    			append_dev(div3, p1);
    			append_dev(p1, t13);
    			append_dev(p1, t14);
    			append_dev(p1, t15);
    			append_dev(p1, t16);
    			append_dev(div5, t17);
    			append_dev(div5, div4);
    			append_dev(div4, img2);
    			append_dev(div4, t18);
    			append_dev(div4, h22);
    			append_dev(div4, t20);
    			append_dev(div4, p2);
    			append_dev(p2, t21);
    			append_dev(p2, t22);
    			append_dev(p2, t23);
    			append_dev(p2, t24);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div14);
    			append_dev(div14, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h50);
    			append_dev(div8, t27);
    			append_dev(div8, table0);
    			append_dev(table0, thead0);
    			append_dev(thead0, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t29);
    			append_dev(tr0, th1);
    			append_dev(tr0, t31);
    			append_dev(tr0, th2);
    			append_dev(tr0, t33);
    			append_dev(tr0, th3);
    			append_dev(tr0, t35);
    			append_dev(tr0, th4);
    			append_dev(table0, t37);
    			append_dev(table0, tbody0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(tbody0, null);
    				}
    			}

    			append_dev(div14, t38);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, h51);
    			append_dev(div11, t40);
    			append_dev(div11, table1);
    			append_dev(table1, thead1);
    			append_dev(thead1, tr1);
    			append_dev(tr1, th5);
    			append_dev(tr1, t42);
    			append_dev(tr1, th6);
    			append_dev(tr1, t44);
    			append_dev(tr1, th7);
    			append_dev(tr1, t46);
    			append_dev(tr1, th8);
    			append_dev(tr1, t48);
    			append_dev(tr1, th9);
    			append_dev(table1, t50);
    			append_dev(table1, tbody1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tbody1, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*completedPlayers*/ 1 && !src_url_equal(img0.src, img0_src_value = /*completedPlayers*/ ctx[0][1]?.roboHashUrl)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if ((!current || dirty & /*completedPlayers*/ 1) && t5_value !== (t5_value = /*completedPlayers*/ ctx[0][1]?.username + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*completedPlayers*/ 1) && t7_value !== (t7_value = /*completedPlayers*/ ctx[0][1]?.score + "")) set_data_dev(t7, t7_value);

    			if (!current || dirty & /*completedPlayers*/ 1 && !src_url_equal(img1.src, img1_src_value = /*completedPlayers*/ ctx[0][0]?.roboHashUrl)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if ((!current || dirty & /*completedPlayers*/ 1) && t13_value !== (t13_value = /*completedPlayers*/ ctx[0][0]?.username + "")) set_data_dev(t13, t13_value);
    			if ((!current || dirty & /*completedPlayers*/ 1) && t15_value !== (t15_value = /*completedPlayers*/ ctx[0][0]?.score + "")) set_data_dev(t15, t15_value);

    			if (!current || dirty & /*completedPlayers*/ 1 && !src_url_equal(img2.src, img2_src_value = /*completedPlayers*/ ctx[0][2]?.roboHashUrl)) {
    				attr_dev(img2, "src", img2_src_value);
    			}

    			if ((!current || dirty & /*completedPlayers*/ 1) && t21_value !== (t21_value = /*completedPlayers*/ ctx[0][2]?.username + "")) set_data_dev(t21, t21_value);
    			if ((!current || dirty & /*completedPlayers*/ 1) && t23_value !== (t23_value = /*completedPlayers*/ ctx[0][2]?.score + "")) set_data_dev(t23, t23_value);

    			if (dirty & /*completedPlayers*/ 1) {
    				each_value_1 = /*completedPlayers*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tbody0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*notCompletedPlayers*/ 2) {
    				each_value = /*notCompletedPlayers*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti0.$$.fragment, local);
    			transition_in(confetti1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti0.$$.fragment, local);
    			transition_out(confetti1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(confetti0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(confetti1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(div15);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Leaderboard', slots, []);
    	const api_root = window.location.origin;
    	let completedPlayers = [];
    	let allPlayers = [];
    	let notCompletedPlayers = [];

    	function getPlayer() {
    		var config = {
    			method: "get",
    			url: api_root + "/api/player"
    		};

    		axios$1(config).then(function (response) {
    			allPlayers = response.data.content.sort((p1, p2) => p2.score - p1.score);
    			$$invalidate(0, completedPlayers = allPlayers.filter(player => player.playerLevelState === "COMPLETED"));
    			$$invalidate(1, notCompletedPlayers = allPlayers.filter(player => player.playerLevelState !== "COMPLETED"));
    		}).catch(function (error) {
    			alert("Could not get players");
    			console.log(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Leaderboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios: axios$1,
    		Confetti,
    		api_root,
    		completedPlayers,
    		allPlayers,
    		notCompletedPlayers,
    		getPlayer
    	});

    	$$self.$inject_state = $$props => {
    		if ('completedPlayers' in $$props) $$invalidate(0, completedPlayers = $$props.completedPlayers);
    		if ('allPlayers' in $$props) allPlayers = $$props.allPlayers;
    		if ('notCompletedPlayers' in $$props) $$invalidate(1, notCompletedPlayers = $$props.notCompletedPlayers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	{
    		getPlayer();
    	}

    	return [completedPlayers, notCompletedPlayers];
    }

    class Leaderboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Leaderboard",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\NotLoggedIn.svelte generated by Svelte v3.59.1 */
    const file$1 = "src\\pages\\NotLoggedIn.svelte";

    // (11:8) {#if !$isAuthenticated}
    function create_if_block$1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Signup to Play!";
    			attr_dev(h2, "class", "signup-text svelte-qh1yuy");
    			add_location(h2, file$1, 11, 12, 264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:8) {#if !$isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let img;
    	let img_src_value;
    	let if_block = !/*$isAuthenticated*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			img = element("img");
    			attr_dev(img, "class", "guessit-logo svelte-qh1yuy");
    			if (!src_url_equal(img.src, img_src_value = "/images/background.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "GuessITLogo");
    			add_location(img, file$1, 13, 8, 333);
    			attr_dev(div0, "class", "guessit svelte-qh1yuy");
    			add_location(div0, file$1, 9, 4, 196);
    			attr_dev(div1, "class", "fullscreen-container svelte-qh1yuy");
    			add_location(div1, file$1, 8, 0, 156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t);
    			append_dev(div0, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*$isAuthenticated*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div0, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $isAuthenticated;
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(0, $isAuthenticated = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotLoggedIn', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotLoggedIn> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ isAuthenticated, $isAuthenticated });

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$isAuthenticated*/ 1) {
    			if ($isAuthenticated) {
    				window.location.assign("#/home");
    			}
    		}
    	};

    	return [$isAuthenticated];
    }

    class NotLoggedIn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotLoggedIn",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var routes = {
        '/': NotLoggedIn,
        '/home': Home,
        '/play': Play,
        '/players': Players,
        '/leaderboards': Leaderboard,
    };

    var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};function t(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}var n=function(){return n=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},n.apply(this,arguments)};function r(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]]);}return n}function o(e,t,n,r){return new(n||(n=Promise))((function(o,i){function c(e){try{s(r.next(e));}catch(e){i(e);}}function a(e){try{s(r.throw(e));}catch(e){i(e);}}function s(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t);}))).then(c,a);}s((r=r.apply(e,t||[])).next());}))}function i(e,t){var n,r,o,i,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;c;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return c.label++,{value:i[1],done:!1};case 5:c.label++,r=i[1],i=[0];continue;case 7:i=c.ops.pop(),c.trys.pop();continue;default:if(!(o=c.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){c=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){c.label=i[1];break}if(6===i[0]&&c.label<o[1]){c.label=o[1],o=i;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(i);break}o[2]&&c.ops.pop(),c.trys.pop();continue}i=t.call(e,c);}catch(e){i=[6,e],r=0;}finally{n=o=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,a])}}}function c(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,o,i=n.call(e),c=[];try{for(;(void 0===t||t-- >0)&&!(r=i.next()).done;)c.push(r.value);}catch(e){o={error:e};}finally{try{r&&!r.done&&(n=i.return)&&n.call(i);}finally{if(o)throw o.error}}return c}function a(e,t,n){if(n||2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))}var s="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function u(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function l(e,t){return e(t={exports:{}},t.exports),t.exports}var f,d,h=function(e){return e&&e.Math==Math&&e},p=h("object"==typeof globalThis&&globalThis)||h("object"==typeof window&&window)||h("object"==typeof self&&self)||h("object"==typeof s&&s)||function(){return this}()||Function("return this")(),y=function(e){try{return !!e()}catch(e){return !0}},v=!y((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]})),m=!y((function(){var e=function(){}.bind();return "function"!=typeof e||e.hasOwnProperty("prototype")})),b=Function.prototype.call,g=m?b.bind(b):function(){return b.apply(b,arguments)},w={}.propertyIsEnumerable,S=Object.getOwnPropertyDescriptor,k=S&&!w.call({1:2},1)?function(e){var t=S(this,e);return !!t&&t.enumerable}:w,_={f:k},I=function(e,t){return {enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}},O=Function,x=O.prototype,T=x.bind,C=x.call,j=m&&T.bind(C,C),L=function(e){return e instanceof O?m?j(e):function(){return C.apply(e,arguments)}:void 0},R=L({}.toString),W=L("".slice),Z=function(e){return W(R(e),8,-1)},E=Object,G=L("".split),A=y((function(){return !E("z").propertyIsEnumerable(0)}))?function(e){return "String"==Z(e)?G(e,""):E(e)}:E,P=function(e){return null==e},X=TypeError,F=function(e){if(P(e))throw X("Can't call method on "+e);return e},K=function(e){return A(F(e))},N="object"==typeof document&&document.all,U={all:N,IS_HTMLDDA:void 0===N&&void 0!==N},D=U.all,H=U.IS_HTMLDDA?function(e){return "function"==typeof e||e===D}:function(e){return "function"==typeof e},Y=U.all,J=U.IS_HTMLDDA?function(e){return "object"==typeof e?null!==e:H(e)||e===Y}:function(e){return "object"==typeof e?null!==e:H(e)},V=function(e){return H(e)?e:void 0},z=function(e,t){return arguments.length<2?V(p[e]):p[e]&&p[e][t]},M=L({}.isPrototypeOf),B=z("navigator","userAgent")||"",Q=p.process,q=p.Deno,$=Q&&Q.versions||q&&q.version,ee=$&&$.v8;ee&&(d=(f=ee.split("."))[0]>0&&f[0]<4?1:+(f[0]+f[1])),!d&&B&&(!(f=B.match(/Edge\/(\d+)/))||f[1]>=74)&&(f=B.match(/Chrome\/(\d+)/))&&(d=+f[1]);var te=d,ne=!!Object.getOwnPropertySymbols&&!y((function(){var e=Symbol();return !String(e)||!(Object(e)instanceof Symbol)||!Symbol.sham&&te&&te<41})),re=ne&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,oe=Object,ie=re?function(e){return "symbol"==typeof e}:function(e){var t=z("Symbol");return H(t)&&M(t.prototype,oe(e))},ce=String,ae=function(e){try{return ce(e)}catch(e){return "Object"}},se=TypeError,ue=function(e){if(H(e))return e;throw se(ae(e)+" is not a function")},le=function(e,t){var n=e[t];return P(n)?void 0:ue(n)},fe=TypeError,de=Object.defineProperty,he=function(e,t){try{de(p,e,{value:t,configurable:!0,writable:!0});}catch(n){p[e]=t;}return t},pe=p["__core-js_shared__"]||he("__core-js_shared__",{}),ye=l((function(e){(e.exports=function(e,t){return pe[e]||(pe[e]=void 0!==t?t:{})})("versions",[]).push({version:"3.25.4",mode:"global",copyright:"© 2014-2022 Denis Pushkarev (zloirock.ru)",license:"https://github.com/zloirock/core-js/blob/v3.25.4/LICENSE",source:"https://github.com/zloirock/core-js"});})),ve=Object,me=function(e){return ve(F(e))},be=L({}.hasOwnProperty),ge=Object.hasOwn||function(e,t){return be(me(e),t)},we=0,Se=Math.random(),ke=L(1..toString),_e=function(e){return "Symbol("+(void 0===e?"":e)+")_"+ke(++we+Se,36)},Ie=ye("wks"),Oe=p.Symbol,xe=Oe&&Oe.for,Te=re?Oe:Oe&&Oe.withoutSetter||_e,Ce=function(e){if(!ge(Ie,e)||!ne&&"string"!=typeof Ie[e]){var t="Symbol."+e;ne&&ge(Oe,e)?Ie[e]=Oe[e]:Ie[e]=re&&xe?xe(t):Te(t);}return Ie[e]},je=TypeError,Le=Ce("toPrimitive"),Re=function(e,t){if(!J(e)||ie(e))return e;var n,r=le(e,Le);if(r){if(void 0===t&&(t="default"),n=g(r,e,t),!J(n)||ie(n))return n;throw je("Can't convert object to primitive value")}return void 0===t&&(t="number"),function(e,t){var n,r;if("string"===t&&H(n=e.toString)&&!J(r=g(n,e)))return r;if(H(n=e.valueOf)&&!J(r=g(n,e)))return r;if("string"!==t&&H(n=e.toString)&&!J(r=g(n,e)))return r;throw fe("Can't convert object to primitive value")}(e,t)},We=function(e){var t=Re(e,"string");return ie(t)?t:t+""},Ze=p.document,Ee=J(Ze)&&J(Ze.createElement),Ge=function(e){return Ee?Ze.createElement(e):{}},Ae=!v&&!y((function(){return 7!=Object.defineProperty(Ge("div"),"a",{get:function(){return 7}}).a})),Pe=Object.getOwnPropertyDescriptor,Xe={f:v?Pe:function(e,t){if(e=K(e),t=We(t),Ae)try{return Pe(e,t)}catch(e){}if(ge(e,t))return I(!g(_.f,e,t),e[t])}},Fe=v&&y((function(){return 42!=Object.defineProperty((function(){}),"prototype",{value:42,writable:!1}).prototype})),Ke=String,Ne=TypeError,Ue=function(e){if(J(e))return e;throw Ne(Ke(e)+" is not an object")},De=TypeError,He=Object.defineProperty,Ye=Object.getOwnPropertyDescriptor,Je={f:v?Fe?function(e,t,n){if(Ue(e),t=We(t),Ue(n),"function"==typeof e&&"prototype"===t&&"value"in n&&"writable"in n&&!n.writable){var r=Ye(e,t);r&&r.writable&&(e[t]=n.value,n={configurable:"configurable"in n?n.configurable:r.configurable,enumerable:"enumerable"in n?n.enumerable:r.enumerable,writable:!1});}return He(e,t,n)}:He:function(e,t,n){if(Ue(e),t=We(t),Ue(n),Ae)try{return He(e,t,n)}catch(e){}if("get"in n||"set"in n)throw De("Accessors not supported");return "value"in n&&(e[t]=n.value),e}},Ve=v?function(e,t,n){return Je.f(e,t,I(1,n))}:function(e,t,n){return e[t]=n,e},ze=Function.prototype,Me=v&&Object.getOwnPropertyDescriptor,Be=ge(ze,"name"),Qe={EXISTS:Be,PROPER:Be&&"something"===function(){}.name,CONFIGURABLE:Be&&(!v||v&&Me(ze,"name").configurable)},qe=L(Function.toString);H(pe.inspectSource)||(pe.inspectSource=function(e){return qe(e)});var $e,et,tt,nt=pe.inspectSource,rt=p.WeakMap,ot=H(rt)&&/native code/.test(String(rt)),it=ye("keys"),ct=function(e){return it[e]||(it[e]=_e(e))},at={},st=p.TypeError,ut=p.WeakMap;if(ot||pe.state){var lt=pe.state||(pe.state=new ut),ft=L(lt.get),dt=L(lt.has),ht=L(lt.set);$e=function(e,t){if(dt(lt,e))throw st("Object already initialized");return t.facade=e,ht(lt,e,t),t},et=function(e){return ft(lt,e)||{}},tt=function(e){return dt(lt,e)};}else {var pt=ct("state");at[pt]=!0,$e=function(e,t){if(ge(e,pt))throw st("Object already initialized");return t.facade=e,Ve(e,pt,t),t},et=function(e){return ge(e,pt)?e[pt]:{}},tt=function(e){return ge(e,pt)};}var yt={set:$e,get:et,has:tt,enforce:function(e){return tt(e)?et(e):$e(e,{})},getterFor:function(e){return function(t){var n;if(!J(t)||(n=et(t)).type!==e)throw st("Incompatible receiver, "+e+" required");return n}}},vt=l((function(e){var t=Qe.CONFIGURABLE,n=yt.enforce,r=yt.get,o=Object.defineProperty,i=v&&!y((function(){return 8!==o((function(){}),"length",{value:8}).length})),c=String(String).split("String"),a=e.exports=function(e,r,a){"Symbol("===String(r).slice(0,7)&&(r="["+String(r).replace(/^Symbol\(([^)]*)\)/,"$1")+"]"),a&&a.getter&&(r="get "+r),a&&a.setter&&(r="set "+r),(!ge(e,"name")||t&&e.name!==r)&&(v?o(e,"name",{value:r,configurable:!0}):e.name=r),i&&a&&ge(a,"arity")&&e.length!==a.arity&&o(e,"length",{value:a.arity});try{a&&ge(a,"constructor")&&a.constructor?v&&o(e,"prototype",{writable:!1}):e.prototype&&(e.prototype=void 0);}catch(e){}var s=n(e);return ge(s,"source")||(s.source=c.join("string"==typeof r?r:"")),e};Function.prototype.toString=a((function(){return H(this)&&r(this).source||nt(this)}),"toString");})),mt=function(e,t,n,r){r||(r={});var o=r.enumerable,i=void 0!==r.name?r.name:t;if(H(n)&&vt(n,i,r),r.global)o?e[t]=n:he(t,n);else {try{r.unsafe?e[t]&&(o=!0):delete e[t];}catch(e){}o?e[t]=n:Je.f(e,t,{value:n,enumerable:!1,configurable:!r.nonConfigurable,writable:!r.nonWritable});}return e},bt=Math.ceil,gt=Math.floor,wt=Math.trunc||function(e){var t=+e;return (t>0?gt:bt)(t)},St=function(e){var t=+e;return t!=t||0===t?0:wt(t)},kt=Math.max,_t=Math.min,It=function(e,t){var n=St(e);return n<0?kt(n+t,0):_t(n,t)},Ot=Math.min,xt=function(e){return e>0?Ot(St(e),9007199254740991):0},Tt=function(e){return xt(e.length)},Ct=function(e){return function(t,n,r){var o,i=K(t),c=Tt(i),a=It(r,c);if(e&&n!=n){for(;c>a;)if((o=i[a++])!=o)return !0}else for(;c>a;a++)if((e||a in i)&&i[a]===n)return e||a||0;return !e&&-1}},jt={includes:Ct(!0),indexOf:Ct(!1)},Lt=jt.indexOf,Rt=L([].push),Wt=function(e,t){var n,r=K(e),o=0,i=[];for(n in r)!ge(at,n)&&ge(r,n)&&Rt(i,n);for(;t.length>o;)ge(r,n=t[o++])&&(~Lt(i,n)||Rt(i,n));return i},Zt=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],Et=Zt.concat("length","prototype"),Gt={f:Object.getOwnPropertyNames||function(e){return Wt(e,Et)}},At={f:Object.getOwnPropertySymbols},Pt=L([].concat),Xt=z("Reflect","ownKeys")||function(e){var t=Gt.f(Ue(e)),n=At.f;return n?Pt(t,n(e)):t},Ft=function(e,t,n){for(var r=Xt(t),o=Je.f,i=Xe.f,c=0;c<r.length;c++){var a=r[c];ge(e,a)||n&&ge(n,a)||o(e,a,i(t,a));}},Kt=/#|\.prototype\./,Nt=function(e,t){var n=Dt[Ut(e)];return n==Yt||n!=Ht&&(H(t)?y(t):!!t)},Ut=Nt.normalize=function(e){return String(e).replace(Kt,".").toLowerCase()},Dt=Nt.data={},Ht=Nt.NATIVE="N",Yt=Nt.POLYFILL="P",Jt=Nt,Vt=Xe.f,zt=function(e,t){var n,r,o,i,c,a=e.target,s=e.global,u=e.stat;if(n=s?p:u?p[a]||he(a,{}):(p[a]||{}).prototype)for(r in t){if(i=t[r],o=e.dontCallGetSet?(c=Vt(n,r))&&c.value:n[r],!Jt(s?r:a+(u?".":"#")+r,e.forced)&&void 0!==o){if(typeof i==typeof o)continue;Ft(i,o);}(e.sham||o&&o.sham)&&Ve(i,"sham",!0),mt(n,r,i,e);}},Mt={};Mt[Ce("toStringTag")]="z";var Bt,Qt="[object z]"===String(Mt),qt=Ce("toStringTag"),$t=Object,en="Arguments"==Z(function(){return arguments}()),tn=Qt?Z:function(e){var t,n,r;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(n=function(e,t){try{return e[t]}catch(e){}}(t=$t(e),qt))?n:en?Z(t):"Object"==(r=Z(t))&&H(t.callee)?"Arguments":r},nn=String,rn=function(e){if("Symbol"===tn(e))throw TypeError("Cannot convert a Symbol value to a string");return nn(e)},on=Ce("match"),cn=TypeError,an=function(e){if(function(e){var t;return J(e)&&(void 0!==(t=e[on])?!!t:"RegExp"==Z(e))}(e))throw cn("The method doesn't accept regular expressions");return e},sn=Ce("match"),un=function(e){var t=/./;try{"/./"[e](t);}catch(n){try{return t[sn]=!1,"/./"[e](t)}catch(e){}}return !1},ln=Xe.f,fn=L("".startsWith),dn=L("".slice),hn=Math.min,pn=un("startsWith"),yn=!(pn||(Bt=ln(String.prototype,"startsWith"),!Bt||Bt.writable));zt({target:"String",proto:!0,forced:!yn&&!pn},{startsWith:function(e){var t=rn(F(this));an(e);var n=xt(hn(arguments.length>1?arguments[1]:void 0,t.length)),r=rn(e);return fn?fn(t,r,n):dn(t,n,n+r.length)===r}});var vn=function(e,t){return L(p[e].prototype[t])};vn("String","startsWith");var mn=Array.isArray||function(e){return "Array"==Z(e)},bn=TypeError,gn=function(e){if(e>9007199254740991)throw bn("Maximum allowed index exceeded");return e},wn=function(e,t,n){var r=We(t);r in e?Je.f(e,r,I(0,n)):e[r]=n;},Sn=function(){},kn=[],_n=z("Reflect","construct"),In=/^\s*(?:class|function)\b/,On=L(In.exec),xn=!In.exec(Sn),Tn=function(e){if(!H(e))return !1;try{return _n(Sn,kn,e),!0}catch(e){return !1}},Cn=function(e){if(!H(e))return !1;switch(tn(e)){case"AsyncFunction":case"GeneratorFunction":case"AsyncGeneratorFunction":return !1}try{return xn||!!On(In,nt(e))}catch(e){return !0}};Cn.sham=!0;var jn,Ln=!_n||y((function(){var e;return Tn(Tn.call)||!Tn(Object)||!Tn((function(){e=!0;}))||e}))?Cn:Tn,Rn=Ce("species"),Wn=Array,Zn=function(e,t){return new(function(e){var t;return mn(e)&&(t=e.constructor,(Ln(t)&&(t===Wn||mn(t.prototype))||J(t)&&null===(t=t[Rn]))&&(t=void 0)),void 0===t?Wn:t}(e))(0===t?0:t)},En=Ce("species"),Gn=Ce("isConcatSpreadable"),An=te>=51||!y((function(){var e=[];return e[Gn]=!1,e.concat()[0]!==e})),Pn=(jn="concat",te>=51||!y((function(){var e=[];return (e.constructor={})[En]=function(){return {foo:1}},1!==e[jn](Boolean).foo}))),Xn=function(e){if(!J(e))return !1;var t=e[Gn];return void 0!==t?!!t:mn(e)};zt({target:"Array",proto:!0,arity:1,forced:!An||!Pn},{concat:function(e){var t,n,r,o,i,c=me(this),a=Zn(c,0),s=0;for(t=-1,r=arguments.length;t<r;t++)if(Xn(i=-1===t?c:arguments[t]))for(o=Tt(i),gn(s+o),n=0;n<o;n++,s++)n in i&&wn(a,s,i[n]);else gn(s+1),wn(a,s++,i);return a.length=s,a}});var Fn=Qt?{}.toString:function(){return "[object "+tn(this)+"]"};Qt||mt(Object.prototype,"toString",Fn,{unsafe:!0});var Kn,Nn=Object.keys||function(e){return Wt(e,Zt)},Un=v&&!Fe?Object.defineProperties:function(e,t){Ue(e);for(var n,r=K(t),o=Nn(t),i=o.length,c=0;i>c;)Je.f(e,n=o[c++],r[n]);return e},Dn={f:Un},Hn=z("document","documentElement"),Yn=ct("IE_PROTO"),Jn=function(){},Vn=function(e){return "<script>"+e+"<\/script>"},zn=function(e){e.write(Vn("")),e.close();var t=e.parentWindow.Object;return e=null,t},Mn=function(){try{Kn=new ActiveXObject("htmlfile");}catch(e){}var e,t;Mn="undefined"!=typeof document?document.domain&&Kn?zn(Kn):((t=Ge("iframe")).style.display="none",Hn.appendChild(t),t.src=String("javascript:"),(e=t.contentWindow.document).open(),e.write(Vn("document.F=Object")),e.close(),e.F):zn(Kn);for(var n=Zt.length;n--;)delete Mn.prototype[Zt[n]];return Mn()};at[Yn]=!0;var Bn=Object.create||function(e,t){var n;return null!==e?(Jn.prototype=Ue(e),n=new Jn,Jn.prototype=null,n[Yn]=e):n=Mn(),void 0===t?n:Dn.f(n,t)},Qn=Array,qn=Math.max,$n=Gt.f,er="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],tr=function(e){try{return $n(e)}catch(e){return function(e,t,n){for(var r=Tt(e),o=It(t,r),i=It(void 0===n?r:n,r),c=Qn(qn(i-o,0)),a=0;o<i;o++,a++)wn(c,a,e[o]);return c.length=a,c}(er)}},nr={f:function(e){return er&&"Window"==Z(e)?tr(e):$n(K(e))}},rr={f:Ce},or=p,ir=Je.f,cr=function(e){var t=or.Symbol||(or.Symbol={});ge(t,e)||ir(t,e,{value:rr.f(e)});},ar=function(){var e=z("Symbol"),t=e&&e.prototype,n=t&&t.valueOf,r=Ce("toPrimitive");t&&!t[r]&&mt(t,r,(function(e){return g(n,this)}),{arity:1});},sr=Je.f,ur=Ce("toStringTag"),lr=function(e,t,n){e&&!n&&(e=e.prototype),e&&!ge(e,ur)&&sr(e,ur,{configurable:!0,value:t});},fr=L(L.bind),dr=function(e,t){return ue(e),void 0===t?e:m?fr(e,t):function(){return e.apply(t,arguments)}},hr=L([].push),pr=function(e){var t=1==e,n=2==e,r=3==e,o=4==e,i=6==e,c=7==e,a=5==e||i;return function(s,u,l,f){for(var d,h,p=me(s),y=A(p),v=dr(u,l),m=Tt(y),b=0,g=f||Zn,w=t?g(s,m):n||c?g(s,0):void 0;m>b;b++)if((a||b in y)&&(h=v(d=y[b],b,p),e))if(t)w[b]=h;else if(h)switch(e){case 3:return !0;case 5:return d;case 6:return b;case 2:hr(w,d);}else switch(e){case 4:return !1;case 7:hr(w,d);}return i?-1:r||o?o:w}},yr={forEach:pr(0),map:pr(1),filter:pr(2),some:pr(3),every:pr(4),find:pr(5),findIndex:pr(6),filterReject:pr(7)}.forEach,vr=ct("hidden"),mr=yt.set,br=yt.getterFor("Symbol"),gr=Object.prototype,wr=p.Symbol,Sr=wr&&wr.prototype,kr=p.TypeError,_r=p.QObject,Ir=Xe.f,Or=Je.f,xr=nr.f,Tr=_.f,Cr=L([].push),jr=ye("symbols"),Lr=ye("op-symbols"),Rr=ye("wks"),Wr=!_r||!_r.prototype||!_r.prototype.findChild,Zr=v&&y((function(){return 7!=Bn(Or({},"a",{get:function(){return Or(this,"a",{value:7}).a}})).a}))?function(e,t,n){var r=Ir(gr,t);r&&delete gr[t],Or(e,t,n),r&&e!==gr&&Or(gr,t,r);}:Or,Er=function(e,t){var n=jr[e]=Bn(Sr);return mr(n,{type:"Symbol",tag:e,description:t}),v||(n.description=t),n},Gr=function(e,t,n){e===gr&&Gr(Lr,t,n),Ue(e);var r=We(t);return Ue(n),ge(jr,r)?(n.enumerable?(ge(e,vr)&&e[vr][r]&&(e[vr][r]=!1),n=Bn(n,{enumerable:I(0,!1)})):(ge(e,vr)||Or(e,vr,I(1,{})),e[vr][r]=!0),Zr(e,r,n)):Or(e,r,n)},Ar=function(e,t){Ue(e);var n=K(t),r=Nn(n).concat(Kr(n));return yr(r,(function(t){v&&!g(Pr,n,t)||Gr(e,t,n[t]);})),e},Pr=function(e){var t=We(e),n=g(Tr,this,t);return !(this===gr&&ge(jr,t)&&!ge(Lr,t))&&(!(n||!ge(this,t)||!ge(jr,t)||ge(this,vr)&&this[vr][t])||n)},Xr=function(e,t){var n=K(e),r=We(t);if(n!==gr||!ge(jr,r)||ge(Lr,r)){var o=Ir(n,r);return !o||!ge(jr,r)||ge(n,vr)&&n[vr][r]||(o.enumerable=!0),o}},Fr=function(e){var t=xr(K(e)),n=[];return yr(t,(function(e){ge(jr,e)||ge(at,e)||Cr(n,e);})),n},Kr=function(e){var t=e===gr,n=xr(t?Lr:K(e)),r=[];return yr(n,(function(e){!ge(jr,e)||t&&!ge(gr,e)||Cr(r,jr[e]);})),r};ne||(Sr=(wr=function(){if(M(Sr,this))throw kr("Symbol is not a constructor");var e=arguments.length&&void 0!==arguments[0]?rn(arguments[0]):void 0,t=_e(e),n=function(e){this===gr&&g(n,Lr,e),ge(this,vr)&&ge(this[vr],t)&&(this[vr][t]=!1),Zr(this,t,I(1,e));};return v&&Wr&&Zr(gr,t,{configurable:!0,set:n}),Er(t,e)}).prototype,mt(Sr,"toString",(function(){return br(this).tag})),mt(wr,"withoutSetter",(function(e){return Er(_e(e),e)})),_.f=Pr,Je.f=Gr,Dn.f=Ar,Xe.f=Xr,Gt.f=nr.f=Fr,At.f=Kr,rr.f=function(e){return Er(Ce(e),e)},v&&(Or(Sr,"description",{configurable:!0,get:function(){return br(this).description}}),mt(gr,"propertyIsEnumerable",Pr,{unsafe:!0}))),zt({global:!0,constructor:!0,wrap:!0,forced:!ne,sham:!ne},{Symbol:wr}),yr(Nn(Rr),(function(e){cr(e);})),zt({target:"Symbol",stat:!0,forced:!ne},{useSetter:function(){Wr=!0;},useSimple:function(){Wr=!1;}}),zt({target:"Object",stat:!0,forced:!ne,sham:!v},{create:function(e,t){return void 0===t?Bn(e):Ar(Bn(e),t)},defineProperty:Gr,defineProperties:Ar,getOwnPropertyDescriptor:Xr}),zt({target:"Object",stat:!0,forced:!ne},{getOwnPropertyNames:Fr}),ar(),lr(wr,"Symbol"),at[vr]=!0;var Nr=ne&&!!Symbol.for&&!!Symbol.keyFor,Ur=ye("string-to-symbol-registry"),Dr=ye("symbol-to-string-registry");zt({target:"Symbol",stat:!0,forced:!Nr},{for:function(e){var t=rn(e);if(ge(Ur,t))return Ur[t];var n=z("Symbol")(t);return Ur[t]=n,Dr[n]=t,n}});var Hr=ye("symbol-to-string-registry");zt({target:"Symbol",stat:!0,forced:!Nr},{keyFor:function(e){if(!ie(e))throw TypeError(ae(e)+" is not a symbol");if(ge(Hr,e))return Hr[e]}});var Yr=Function.prototype,Jr=Yr.apply,Vr=Yr.call,zr="object"==typeof Reflect&&Reflect.apply||(m?Vr.bind(Jr):function(){return Vr.apply(Jr,arguments)}),Mr=L([].slice),Br=z("JSON","stringify"),Qr=L(/./.exec),qr=L("".charAt),$r=L("".charCodeAt),eo=L("".replace),to=L(1..toString),no=/[\uD800-\uDFFF]/g,ro=/^[\uD800-\uDBFF]$/,oo=/^[\uDC00-\uDFFF]$/,io=!ne||y((function(){var e=z("Symbol")();return "[null]"!=Br([e])||"{}"!=Br({a:e})||"{}"!=Br(Object(e))})),co=y((function(){return '"\\udf06\\ud834"'!==Br("\udf06\ud834")||'"\\udead"'!==Br("\udead")})),ao=function(e,t){var n=Mr(arguments),r=t;if((J(t)||void 0!==e)&&!ie(e))return mn(t)||(t=function(e,t){if(H(r)&&(t=g(r,this,e,t)),!ie(t))return t}),n[1]=t,zr(Br,null,n)},so=function(e,t,n){var r=qr(n,t-1),o=qr(n,t+1);return Qr(ro,e)&&!Qr(oo,o)||Qr(oo,e)&&!Qr(ro,r)?"\\u"+to($r(e,0),16):e};Br&&zt({target:"JSON",stat:!0,arity:3,forced:io||co},{stringify:function(e,t,n){var r=Mr(arguments),o=zr(io?ao:Br,null,r);return co&&"string"==typeof o?eo(o,no,so):o}});var uo=!ne||y((function(){At.f(1);}));zt({target:"Object",stat:!0,forced:uo},{getOwnPropertySymbols:function(e){var t=At.f;return t?t(me(e)):[]}}),cr("asyncIterator");var lo=Je.f,fo=p.Symbol,ho=fo&&fo.prototype;if(v&&H(fo)&&(!("description"in ho)||void 0!==fo().description)){var po={},yo=function(){var e=arguments.length<1||void 0===arguments[0]?void 0:rn(arguments[0]),t=M(ho,this)?new fo(e):void 0===e?fo():fo(e);return ""===e&&(po[t]=!0),t};Ft(yo,fo),yo.prototype=ho,ho.constructor=yo;var vo="Symbol(test)"==String(fo("test")),mo=L(ho.valueOf),bo=L(ho.toString),go=/^Symbol\((.*)\)[^)]+$/,wo=L("".replace),So=L("".slice);lo(ho,"description",{configurable:!0,get:function(){var e=mo(this);if(ge(po,e))return "";var t=bo(e),n=vo?So(t,7,-1):wo(t,go,"$1");return ""===n?void 0:n}}),zt({global:!0,constructor:!0,forced:!0},{Symbol:yo});}cr("hasInstance"),cr("isConcatSpreadable"),cr("iterator"),cr("match"),cr("matchAll"),cr("replace"),cr("search"),cr("species"),cr("split"),cr("toPrimitive"),ar(),cr("toStringTag"),lr(z("Symbol"),"Symbol"),cr("unscopables"),lr(p.JSON,"JSON",!0),lr(Math,"Math",!0),zt({global:!0},{Reflect:{}}),lr(p.Reflect,"Reflect",!0),or.Symbol;var ko,_o,Io,Oo=L("".charAt),xo=L("".charCodeAt),To=L("".slice),Co=function(e){return function(t,n){var r,o,i=rn(F(t)),c=St(n),a=i.length;return c<0||c>=a?e?"":void 0:(r=xo(i,c))<55296||r>56319||c+1===a||(o=xo(i,c+1))<56320||o>57343?e?Oo(i,c):r:e?To(i,c,c+2):o-56320+(r-55296<<10)+65536}},jo={codeAt:Co(!1),charAt:Co(!0)},Lo=!y((function(){function e(){}return e.prototype.constructor=null,Object.getPrototypeOf(new e)!==e.prototype})),Ro=ct("IE_PROTO"),Wo=Object,Zo=Wo.prototype,Eo=Lo?Wo.getPrototypeOf:function(e){var t=me(e);if(ge(t,Ro))return t[Ro];var n=t.constructor;return H(n)&&t instanceof n?n.prototype:t instanceof Wo?Zo:null},Go=Ce("iterator"),Ao=!1;[].keys&&("next"in(Io=[].keys())?(_o=Eo(Eo(Io)))!==Object.prototype&&(ko=_o):Ao=!0);var Po=!J(ko)||y((function(){var e={};return ko[Go].call(e)!==e}));Po&&(ko={}),H(ko[Go])||mt(ko,Go,(function(){return this}));var Xo={IteratorPrototype:ko,BUGGY_SAFARI_ITERATORS:Ao},Fo={},Ko=Xo.IteratorPrototype,No=function(){return this},Uo=String,Do=TypeError,Ho=Object.setPrototypeOf||("__proto__"in{}?function(){var e,t=!1,n={};try{(e=L(Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set))(n,[]),t=n instanceof Array;}catch(e){}return function(n,r){return Ue(n),function(e){if("object"==typeof e||H(e))return e;throw Do("Can't set "+Uo(e)+" as a prototype")}(r),t?e(n,r):n.__proto__=r,n}}():void 0),Yo=Qe.PROPER,Jo=Qe.CONFIGURABLE,Vo=Xo.IteratorPrototype,zo=Xo.BUGGY_SAFARI_ITERATORS,Mo=Ce("iterator"),Bo=function(){return this},Qo=function(e,t,n,r,o,i,c){!function(e,t,n,r){var o=t+" Iterator";e.prototype=Bn(Ko,{next:I(+!r,n)}),lr(e,o,!1),Fo[o]=No;}(n,t,r);var a,s,u,l=function(e){if(e===o&&y)return y;if(!zo&&e in h)return h[e];switch(e){case"keys":case"values":case"entries":return function(){return new n(this,e)}}return function(){return new n(this)}},f=t+" Iterator",d=!1,h=e.prototype,p=h[Mo]||h["@@iterator"]||o&&h[o],y=!zo&&p||l(o),v="Array"==t&&h.entries||p;if(v&&(a=Eo(v.call(new e)))!==Object.prototype&&a.next&&(Eo(a)!==Vo&&(Ho?Ho(a,Vo):H(a[Mo])||mt(a,Mo,Bo)),lr(a,f,!0)),Yo&&"values"==o&&p&&"values"!==p.name&&(Jo?Ve(h,"name","values"):(d=!0,y=function(){return g(p,this)})),o)if(s={values:l("values"),keys:i?y:l("keys"),entries:l("entries")},c)for(u in s)(zo||d||!(u in h))&&mt(h,u,s[u]);else zt({target:t,proto:!0,forced:zo||d},s);return h[Mo]!==y&&mt(h,Mo,y,{name:o}),Fo[t]=y,s},qo=function(e,t){return {value:e,done:t}},$o=jo.charAt,ei=yt.set,ti=yt.getterFor("String Iterator");Qo(String,"String",(function(e){ei(this,{type:"String Iterator",string:rn(e),index:0});}),(function(){var e,t=ti(this),n=t.string,r=t.index;return r>=n.length?qo(void 0,!0):(e=$o(n,r),t.index+=e.length,qo(e,!1))}));var ni=function(e,t,n){var r,o;Ue(e);try{if(!(r=le(e,"return"))){if("throw"===t)throw n;return n}r=g(r,e);}catch(e){o=!0,r=e;}if("throw"===t)throw n;if(o)throw r;return Ue(r),n},ri=function(e,t,n,r){try{return r?t(Ue(n)[0],n[1]):t(n)}catch(t){ni(e,"throw",t);}},oi=Ce("iterator"),ii=Array.prototype,ci=function(e){return void 0!==e&&(Fo.Array===e||ii[oi]===e)},ai=Ce("iterator"),si=function(e){if(!P(e))return le(e,ai)||le(e,"@@iterator")||Fo[tn(e)]},ui=TypeError,li=function(e,t){var n=arguments.length<2?si(e):t;if(ue(n))return Ue(g(n,e));throw ui(ae(e)+" is not iterable")},fi=Array,di=Ce("iterator"),hi=!1;try{var pi=0,yi={next:function(){return {done:!!pi++}},return:function(){hi=!0;}};yi[di]=function(){return this},Array.from(yi,(function(){throw 2}));}catch(e){}var vi=function(e,t){if(!t&&!hi)return !1;var n=!1;try{var r={};r[di]=function(){return {next:function(){return {done:n=!0}}}},e(r);}catch(e){}return n},mi=!vi((function(e){Array.from(e);}));zt({target:"Array",stat:!0,forced:mi},{from:function(e){var t=me(e),n=Ln(this),r=arguments.length,o=r>1?arguments[1]:void 0,i=void 0!==o;i&&(o=dr(o,r>2?arguments[2]:void 0));var c,a,s,u,l,f,d=si(t),h=0;if(!d||this===fi&&ci(d))for(c=Tt(t),a=n?new this(c):fi(c);c>h;h++)f=i?o(t[h],h):t[h],wn(a,h,f);else for(l=(u=li(t,d)).next,a=n?new this:[];!(s=g(l,u)).done;h++)f=i?ri(u,o,[s.value,h],!0):s.value,wn(a,h,f);return a.length=h,a}}),or.Array.from;var bi,gi,wi,Si="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof DataView,ki=Je.f,_i=yt.enforce,Ii=yt.get,Oi=p.Int8Array,xi=Oi&&Oi.prototype,Ti=p.Uint8ClampedArray,Ci=Ti&&Ti.prototype,ji=Oi&&Eo(Oi),Li=xi&&Eo(xi),Ri=Object.prototype,Wi=p.TypeError,Zi=Ce("toStringTag"),Ei=_e("TYPED_ARRAY_TAG"),Gi=Si&&!!Ho&&"Opera"!==tn(p.opera),Ai=!1,Pi={Int8Array:1,Uint8Array:1,Uint8ClampedArray:1,Int16Array:2,Uint16Array:2,Int32Array:4,Uint32Array:4,Float32Array:4,Float64Array:8},Xi={BigInt64Array:8,BigUint64Array:8},Fi=function(e){var t=Eo(e);if(J(t)){var n=Ii(t);return n&&ge(n,"TypedArrayConstructor")?n.TypedArrayConstructor:Fi(t)}},Ki=function(e){if(!J(e))return !1;var t=tn(e);return ge(Pi,t)||ge(Xi,t)};for(bi in Pi)(wi=(gi=p[bi])&&gi.prototype)?_i(wi).TypedArrayConstructor=gi:Gi=!1;for(bi in Xi)(wi=(gi=p[bi])&&gi.prototype)&&(_i(wi).TypedArrayConstructor=gi);if((!Gi||!H(ji)||ji===Function.prototype)&&(ji=function(){throw Wi("Incorrect invocation")},Gi))for(bi in Pi)p[bi]&&Ho(p[bi],ji);if((!Gi||!Li||Li===Ri)&&(Li=ji.prototype,Gi))for(bi in Pi)p[bi]&&Ho(p[bi].prototype,Li);if(Gi&&Eo(Ci)!==Li&&Ho(Ci,Li),v&&!ge(Li,Zi))for(bi in Ai=!0,ki(Li,Zi,{get:function(){return J(this)?this[Ei]:void 0}}),Pi)p[bi]&&Ve(p[bi],Ei,bi);var Ni={NATIVE_ARRAY_BUFFER_VIEWS:Gi,TYPED_ARRAY_TAG:Ai&&Ei,aTypedArray:function(e){if(Ki(e))return e;throw Wi("Target is not a typed array")},aTypedArrayConstructor:function(e){if(H(e)&&(!Ho||M(ji,e)))return e;throw Wi(ae(e)+" is not a typed array constructor")},exportTypedArrayMethod:function(e,t,n,r){if(v){if(n)for(var o in Pi){var i=p[o];if(i&&ge(i.prototype,e))try{delete i.prototype[e];}catch(n){try{i.prototype[e]=t;}catch(e){}}}Li[e]&&!n||mt(Li,e,n?t:Gi&&xi[e]||t,r);}},exportTypedArrayStaticMethod:function(e,t,n){var r,o;if(v){if(Ho){if(n)for(r in Pi)if((o=p[r])&&ge(o,e))try{delete o[e];}catch(e){}if(ji[e]&&!n)return;try{return mt(ji,e,n?t:Gi&&ji[e]||t)}catch(e){}}for(r in Pi)!(o=p[r])||o[e]&&!n||mt(o,e,t);}},getTypedArrayConstructor:Fi,isView:function(e){if(!J(e))return !1;var t=tn(e);return "DataView"===t||ge(Pi,t)||ge(Xi,t)},isTypedArray:Ki,TypedArray:ji,TypedArrayPrototype:Li},Ui=TypeError,Di=Ce("species"),Hi=function(e,t){var n,r=Ue(e).constructor;return void 0===r||P(n=Ue(r)[Di])?t:function(e){if(Ln(e))return e;throw Ui(ae(e)+" is not a constructor")}(n)},Yi=Ni.aTypedArrayConstructor,Ji=Ni.getTypedArrayConstructor,Vi=Ni.aTypedArray;(0, Ni.exportTypedArrayMethod)("slice",(function(e,t){for(var n,r=Mr(Vi(this),e,t),o=Yi(Hi(n=this,Ji(n))),i=0,c=r.length,a=new o(c);c>i;)a[i]=r[i++];return a}),y((function(){new Int8Array(1).slice();})));var zi=Je.f,Mi=Ce("unscopables"),Bi=Array.prototype;null==Bi[Mi]&&zi(Bi,Mi,{configurable:!0,value:Bn(null)});var Qi=function(e){Bi[Mi][e]=!0;},qi=jt.includes,$i=y((function(){return !Array(1).includes()}));zt({target:"Array",proto:!0,forced:$i},{includes:function(e){return qi(this,e,arguments.length>1?arguments[1]:void 0)}}),Qi("includes"),vn("Array","includes");var ec=L("".indexOf);zt({target:"String",proto:!0,forced:!un("includes")},{includes:function(e){return !!~ec(rn(F(this)),rn(an(e)),arguments.length>1?arguments[1]:void 0)}}),vn("String","includes");var tc=Je.f,nc=yt.set,rc=yt.getterFor("Array Iterator");Qo(Array,"Array",(function(e,t){nc(this,{type:"Array Iterator",target:K(e),index:0,kind:t});}),(function(){var e=rc(this),t=e.target,n=e.kind,r=e.index++;return !t||r>=t.length?(e.target=void 0,qo(void 0,!0)):qo("keys"==n?r:"values"==n?t[r]:[r,t[r]],!1)}),"values");var oc=Fo.Arguments=Fo.Array;if(Qi("keys"),Qi("values"),Qi("entries"),v&&"values"!==oc.name)try{tc(oc,"name",{value:"values"});}catch(e){}var ic=y((function(){if("function"==typeof ArrayBuffer){var e=new ArrayBuffer(8);Object.isExtensible(e)&&Object.defineProperty(e,"a",{value:8});}})),cc=Object.isExtensible,ac=y((function(){cc(1);}))||ic?function(e){return !!J(e)&&((!ic||"ArrayBuffer"!=Z(e))&&(!cc||cc(e)))}:cc,sc=!y((function(){return Object.isExtensible(Object.preventExtensions({}))})),uc=l((function(e){var t=Je.f,n=!1,r=_e("meta"),o=0,i=function(e){t(e,r,{value:{objectID:"O"+o++,weakData:{}}});},c=e.exports={enable:function(){c.enable=function(){},n=!0;var e=Gt.f,t=L([].splice),o={};o[r]=1,e(o).length&&(Gt.f=function(n){for(var o=e(n),i=0,c=o.length;i<c;i++)if(o[i]===r){t(o,i,1);break}return o},zt({target:"Object",stat:!0,forced:!0},{getOwnPropertyNames:nr.f}));},fastKey:function(e,t){if(!J(e))return "symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!ge(e,r)){if(!ac(e))return "F";if(!t)return "E";i(e);}return e[r].objectID},getWeakData:function(e,t){if(!ge(e,r)){if(!ac(e))return !0;if(!t)return !1;i(e);}return e[r].weakData},onFreeze:function(e){return sc&&n&&ac(e)&&!ge(e,r)&&i(e),e}};at[r]=!0;}));uc.enable,uc.fastKey,uc.getWeakData,uc.onFreeze;var lc=TypeError,fc=function(e,t){this.stopped=e,this.result=t;},dc=fc.prototype,hc=function(e,t,n){var r,o,i,c,a,s,u,l=n&&n.that,f=!(!n||!n.AS_ENTRIES),d=!(!n||!n.IS_RECORD),h=!(!n||!n.IS_ITERATOR),p=!(!n||!n.INTERRUPTED),y=dr(t,l),v=function(e){return r&&ni(r,"normal",e),new fc(!0,e)},m=function(e){return f?(Ue(e),p?y(e[0],e[1],v):y(e[0],e[1])):p?y(e,v):y(e)};if(d)r=e.iterator;else if(h)r=e;else {if(!(o=si(e)))throw lc(ae(e)+" is not iterable");if(ci(o)){for(i=0,c=Tt(e);c>i;i++)if((a=m(e[i]))&&M(dc,a))return a;return new fc(!1)}r=li(e,o);}for(s=d?e.next:r.next;!(u=g(s,r)).done;){try{a=m(u.value);}catch(e){ni(r,"throw",e);}if("object"==typeof a&&a&&M(dc,a))return a}return new fc(!1)},pc=TypeError,yc=function(e,t){if(M(t,e))return e;throw pc("Incorrect invocation")},vc=function(e,t,n){for(var r in t)mt(e,r,t[r],n);return e},mc=Ce("species"),bc=Je.f,gc=uc.fastKey,wc=yt.set,Sc=yt.getterFor,kc={getConstructor:function(e,t,n,r){var o=e((function(e,o){yc(e,i),wc(e,{type:t,index:Bn(null),first:void 0,last:void 0,size:0}),v||(e.size=0),P(o)||hc(o,e[r],{that:e,AS_ENTRIES:n});})),i=o.prototype,c=Sc(t),a=function(e,t,n){var r,o,i=c(e),a=s(e,t);return a?a.value=n:(i.last=a={index:o=gc(t,!0),key:t,value:n,previous:r=i.last,next:void 0,removed:!1},i.first||(i.first=a),r&&(r.next=a),v?i.size++:e.size++,"F"!==o&&(i.index[o]=a)),e},s=function(e,t){var n,r=c(e),o=gc(t);if("F"!==o)return r.index[o];for(n=r.first;n;n=n.next)if(n.key==t)return n};return vc(i,{clear:function(){for(var e=c(this),t=e.index,n=e.first;n;)n.removed=!0,n.previous&&(n.previous=n.previous.next=void 0),delete t[n.index],n=n.next;e.first=e.last=void 0,v?e.size=0:this.size=0;},delete:function(e){var t=this,n=c(t),r=s(t,e);if(r){var o=r.next,i=r.previous;delete n.index[r.index],r.removed=!0,i&&(i.next=o),o&&(o.previous=i),n.first==r&&(n.first=o),n.last==r&&(n.last=i),v?n.size--:t.size--;}return !!r},forEach:function(e){for(var t,n=c(this),r=dr(e,arguments.length>1?arguments[1]:void 0);t=t?t.next:n.first;)for(r(t.value,t.key,this);t&&t.removed;)t=t.previous;},has:function(e){return !!s(this,e)}}),vc(i,n?{get:function(e){var t=s(this,e);return t&&t.value},set:function(e,t){return a(this,0===e?0:e,t)}}:{add:function(e){return a(this,e=0===e?0:e,e)}}),v&&bc(i,"size",{get:function(){return c(this).size}}),o},setStrong:function(e,t,n){var r=t+" Iterator",o=Sc(t),i=Sc(r);Qo(e,t,(function(e,t){wc(this,{type:r,target:e,state:o(e),kind:t,last:void 0});}),(function(){for(var e=i(this),t=e.kind,n=e.last;n&&n.removed;)n=n.previous;return e.target&&(e.last=n=n?n.next:e.state.first)?qo("keys"==t?n.key:"values"==t?n.value:[n.key,n.value],!1):(e.target=void 0,qo(void 0,!0))}),n?"entries":"values",!n,!0),function(e){var t=z(e),n=Je.f;v&&t&&!t[mc]&&n(t,mc,{configurable:!0,get:function(){return this}});}(t);}};function _c(e){var t=this.constructor;return this.then((function(n){return t.resolve(e()).then((function(){return n}))}),(function(n){return t.resolve(e()).then((function(){return t.reject(n)}))}))}function Ic(e){return new this((function(t,n){if(!e||void 0===e.length)return n(new TypeError(typeof e+" "+e+" is not iterable(cannot read property Symbol(Symbol.iterator))"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);var o=r.length;function i(e,n){if(n&&("object"==typeof n||"function"==typeof n)){var c=n.then;if("function"==typeof c)return void c.call(n,(function(t){i(e,t);}),(function(n){r[e]={status:"rejected",reason:n},0==--o&&t(r);}))}r[e]={status:"fulfilled",value:n},0==--o&&t(r);}for(var c=0;c<r.length;c++)i(c,r[c]);}))}!function(e,t,n){var r=-1!==e.indexOf("Map"),o=-1!==e.indexOf("Weak"),i=r?"set":"add",c=p[e],a=c&&c.prototype,s=c,u={},l=function(e){var t=L(a[e]);mt(a,e,"add"==e?function(e){return t(this,0===e?0:e),this}:"delete"==e?function(e){return !(o&&!J(e))&&t(this,0===e?0:e)}:"get"==e?function(e){return o&&!J(e)?void 0:t(this,0===e?0:e)}:"has"==e?function(e){return !(o&&!J(e))&&t(this,0===e?0:e)}:function(e,n){return t(this,0===e?0:e,n),this});};if(Jt(e,!H(c)||!(o||a.forEach&&!y((function(){(new c).entries().next();})))))s=n.getConstructor(t,e,r,i),uc.enable();else if(Jt(e,!0)){var f=new s,d=f[i](o?{}:-0,1)!=f,h=y((function(){f.has(1);})),v=vi((function(e){new c(e);})),m=!o&&y((function(){for(var e=new c,t=5;t--;)e[i](t,t);return !e.has(-0)}));v||((s=t((function(e,t){yc(e,a);var n=function(e,t,n){var r,o;return Ho&&H(r=t.constructor)&&r!==n&&J(o=r.prototype)&&o!==n.prototype&&Ho(e,o),e}(new c,e,s);return P(t)||hc(t,n[i],{that:n,AS_ENTRIES:r}),n}))).prototype=a,a.constructor=s),(h||m)&&(l("delete"),l("has"),r&&l("get")),(m||d)&&l(i),o&&a.clear&&delete a.clear;}u[e]=s,zt({global:!0,constructor:!0,forced:s!=c},u),lr(s,e),o||n.setStrong(s,e,r);}("Set",(function(e){return function(){return e(this,arguments.length?arguments[0]:void 0)}}),kc),or.Set;var Oc=setTimeout;function xc(e){return Boolean(e&&void 0!==e.length)}function Tc(){}function Cc(e){if(!(this instanceof Cc))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],Ec(e,this);}function jc(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,Cc._immediateFn((function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var r;try{r=n(e._value);}catch(e){return void Rc(t.promise,e)}Lc(t.promise,r);}else (1===e._state?Lc:Rc)(t.promise,e._value);}))):e._deferreds.push(t);}function Lc(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof Cc)return e._state=3,e._value=t,void Wc(e);if("function"==typeof n)return void Ec((r=n,o=t,function(){r.apply(o,arguments);}),e)}e._state=1,e._value=t,Wc(e);}catch(t){Rc(e,t);}var r,o;}function Rc(e,t){e._state=2,e._value=t,Wc(e);}function Wc(e){2===e._state&&0===e._deferreds.length&&Cc._immediateFn((function(){e._handled||Cc._unhandledRejectionFn(e._value);}));for(var t=0,n=e._deferreds.length;t<n;t++)jc(e,e._deferreds[t]);e._deferreds=null;}function Zc(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n;}function Ec(e,t){var n=!1;try{e((function(e){n||(n=!0,Lc(t,e));}),(function(e){n||(n=!0,Rc(t,e));}));}catch(e){if(n)return;n=!0,Rc(t,e);}}Cc.prototype.catch=function(e){return this.then(null,e)},Cc.prototype.then=function(e,t){var n=new this.constructor(Tc);return jc(this,new Zc(e,t,n)),n},Cc.prototype.finally=_c,Cc.all=function(e){return new Cc((function(t,n){if(!xc(e))return n(new TypeError("Promise.all accepts an array"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);var o=r.length;function i(e,c){try{if(c&&("object"==typeof c||"function"==typeof c)){var a=c.then;if("function"==typeof a)return void a.call(c,(function(t){i(e,t);}),n)}r[e]=c,0==--o&&t(r);}catch(e){n(e);}}for(var c=0;c<r.length;c++)i(c,r[c]);}))},Cc.allSettled=Ic,Cc.resolve=function(e){return e&&"object"==typeof e&&e.constructor===Cc?e:new Cc((function(t){t(e);}))},Cc.reject=function(e){return new Cc((function(t,n){n(e);}))},Cc.race=function(e){return new Cc((function(t,n){if(!xc(e))return n(new TypeError("Promise.race accepts an array"));for(var r=0,o=e.length;r<o;r++)Cc.resolve(e[r]).then(t,n);}))},Cc._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e);}||function(e){Oc(e,0);},Cc._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e);};var Gc=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("unable to locate global object")}();"function"!=typeof Gc.Promise?Gc.Promise=Cc:(Gc.Promise.prototype.finally||(Gc.Promise.prototype.finally=_c),Gc.Promise.allSettled||(Gc.Promise.allSettled=Ic)),function(e){function t(e){for(var t=0,n=Math.min(65536,e.length+1),r=new Uint16Array(n),o=[],i=0;;){var c=t<e.length;if(!c||i>=n-1){var a=r.subarray(0,i);if(o.push(String.fromCharCode.apply(null,a)),!c)return o.join("");e=e.subarray(t),t=0,i=0;}var s=e[t++];if(0==(128&s))r[i++]=s;else if(192==(224&s)){var u=63&e[t++];r[i++]=(31&s)<<6|u;}else if(224==(240&s)){u=63&e[t++];var l=63&e[t++];r[i++]=(31&s)<<12|u<<6|l;}else if(240==(248&s)){var f=(7&s)<<18|(u=63&e[t++])<<12|(l=63&e[t++])<<6|63&e[t++];f>65535&&(f-=65536,r[i++]=f>>>10&1023|55296,f=56320|1023&f),r[i++]=f;}}}var n="Failed to ",r=function(e,t,r){if(e)throw new Error("".concat(n).concat(t,": the '").concat(r,"' option is unsupported."))},o="function"==typeof Buffer&&Buffer.from,i=o?function(e){return Buffer.from(e)}:function(e){for(var t=0,n=e.length,r=0,o=Math.max(32,n+(n>>>1)+7),i=new Uint8Array(o>>>3<<3);t<n;){var c=e.charCodeAt(t++);if(c>=55296&&c<=56319){if(t<n){var a=e.charCodeAt(t);56320==(64512&a)&&(++t,c=((1023&c)<<10)+(1023&a)+65536);}if(c>=55296&&c<=56319)continue}if(r+4>i.length){o+=8,o=(o*=1+t/e.length*2)>>>3<<3;var s=new Uint8Array(o);s.set(i),i=s;}if(0!=(4294967168&c)){if(0==(4294965248&c))i[r++]=c>>>6&31|192;else if(0==(4294901760&c))i[r++]=c>>>12&15|224,i[r++]=c>>>6&63|128;else {if(0!=(4292870144&c))continue;i[r++]=c>>>18&7|240,i[r++]=c>>>12&63|128,i[r++]=c>>>6&63|128;}i[r++]=63&c|128;}else i[r++]=c;}return i.slice?i.slice(0,r):i.subarray(0,r)};function c(){this.encoding="utf-8";}c.prototype.encode=function(e,t){return r(t&&t.stream,"encode","stream"),i(e)};var a=!o&&"function"==typeof Blob&&"function"==typeof URL&&"function"==typeof URL.createObjectURL,s=["utf-8","utf8","unicode-1-1-utf-8"],u=t;o?u=function(e,t){return (e instanceof Buffer?e:Buffer.from(e.buffer,e.byteOffset,e.byteLength)).toString(t)}:a&&(u=function(e){try{return function(e){var t;try{var n=new Blob([e],{type:"text/plain;charset=UTF-8"});t=URL.createObjectURL(n);var r=new XMLHttpRequest;return r.open("GET",t,!1),r.send(),r.responseText}finally{t&&URL.revokeObjectURL(t);}}(e)}catch(n){return t(e)}});var l="construct 'TextDecoder'",f="".concat(n," ").concat(l,": the ");function d(e,t){if(r(t&&t.fatal,l,"fatal"),e=e||"utf-8",!(o?Buffer.isEncoding(e):-1!==s.indexOf(e.toLowerCase())))throw new RangeError("".concat(f," encoding label provided ('").concat(e,"') is invalid."));this.encoding=e,this.fatal=!1,this.ignoreBOM=!1;}d.prototype.decode=function(e,t){var n;return r(t&&t.stream,"decode","stream"),n=e instanceof Uint8Array?e:e.buffer instanceof ArrayBuffer?new Uint8Array(e.buffer):new Uint8Array(e),u(n,this.encoding)},e.TextEncoder=e.TextEncoder||c,e.TextDecoder=e.TextDecoder||d;}("undefined"!=typeof window?window:s),function(){function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function n(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}function r(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&i(e,t);}function o(e){return o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},o(e)}function i(e,t){return i=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},i(e,t)}function c(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}function a(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function u(e,t){return !t||"object"!=typeof t&&"function"!=typeof t?a(e):t}function l(e){var t=c();return function(){var n,r=o(e);if(t){var i=o(this).constructor;n=Reflect.construct(r,arguments,i);}else n=r.apply(this,arguments);return u(this,n)}}function f(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=o(e)););return e}function d(e,t,n){return d="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=f(e,t);if(r){var o=Object.getOwnPropertyDescriptor(r,t);return o.get?o.get.call(n):o.value}},d(e,t,n||e)}var h=function(){function t(){e(this,t),Object.defineProperty(this,"listeners",{value:{},writable:!0,configurable:!0});}return n(t,[{key:"addEventListener",value:function(e,t,n){e in this.listeners||(this.listeners[e]=[]),this.listeners[e].push({callback:t,options:n});}},{key:"removeEventListener",value:function(e,t){if(e in this.listeners)for(var n=this.listeners[e],r=0,o=n.length;r<o;r++)if(n[r].callback===t)return void n.splice(r,1)}},{key:"dispatchEvent",value:function(e){if(e.type in this.listeners){for(var t=this.listeners[e.type].slice(),n=0,r=t.length;n<r;n++){var o=t[n];try{o.callback.call(this,e);}catch(e){Promise.resolve().then((function(){throw e}));}o.options&&o.options.once&&this.removeEventListener(e.type,o.callback);}return !e.defaultPrevented}}}]),t}(),p=function(t){r(c,t);var i=l(c);function c(){var t;return e(this,c),(t=i.call(this)).listeners||h.call(a(t)),Object.defineProperty(a(t),"aborted",{value:!1,writable:!0,configurable:!0}),Object.defineProperty(a(t),"onabort",{value:null,writable:!0,configurable:!0}),t}return n(c,[{key:"toString",value:function(){return "[object AbortSignal]"}},{key:"dispatchEvent",value:function(e){"abort"===e.type&&(this.aborted=!0,"function"==typeof this.onabort&&this.onabort.call(this,e)),d(o(c.prototype),"dispatchEvent",this).call(this,e);}}]),c}(h),y=function(){function t(){e(this,t),Object.defineProperty(this,"signal",{value:new p,writable:!0,configurable:!0});}return n(t,[{key:"abort",value:function(){var e;try{e=new Event("abort");}catch(t){"undefined"!=typeof document?document.createEvent?(e=document.createEvent("Event")).initEvent("abort",!1,!1):(e=document.createEventObject()).type="abort":e={type:"abort",bubbles:!1,cancelable:!1};}this.signal.dispatchEvent(e);}},{key:"toString",value:function(){return "[object AbortController]"}}]),t}();function v(e){return e.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL?(console.log("__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill"),!0):"function"==typeof e.Request&&!e.Request.prototype.hasOwnProperty("signal")||!e.AbortController}"undefined"!=typeof Symbol&&Symbol.toStringTag&&(y.prototype[Symbol.toStringTag]="AbortController",p.prototype[Symbol.toStringTag]="AbortSignal"),function(e){v(e)&&(e.AbortController=y,e.AbortSignal=p);}("undefined"!=typeof self?self:s);}();var Ac=l((function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function e(){var e=this;this.locked=new Map,this.addToLocked=function(t,n){var r=e.locked.get(t);void 0===r?void 0===n?e.locked.set(t,[]):e.locked.set(t,[n]):void 0!==n&&(r.unshift(n),e.locked.set(t,r));},this.isLocked=function(t){return e.locked.has(t)},this.lock=function(t){return new Promise((function(n,r){e.isLocked(t)?e.addToLocked(t,n):(e.addToLocked(t),n());}))},this.unlock=function(t){var n=e.locked.get(t);if(void 0!==n&&0!==n.length){var r=n.pop();e.locked.set(t,n),void 0!==r&&setTimeout(r,0);}else e.locked.delete(t);};}return e.getInstance=function(){return void 0===e.instance&&(e.instance=new e),e.instance},e}();t.default=function(){return n.getInstance()};}));u(Ac);var Pc=l((function(e,t){var n=s&&s.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function c(e){try{s(r.next(e));}catch(e){i(e);}}function a(e){try{s(r.throw(e));}catch(e){i(e);}}function s(e){e.done?o(e.value):new n((function(t){t(e.value);})).then(c,a);}s((r=r.apply(e,t||[])).next());}))},r=s&&s.__generator||function(e,t){var n,r,o,i,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;c;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return c.label++,{value:i[1],done:!1};case 5:c.label++,r=i[1],i=[0];continue;case 7:i=c.ops.pop(),c.trys.pop();continue;default:if(!(o=c.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){c=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){c.label=i[1];break}if(6===i[0]&&c.label<o[1]){c.label=o[1],o=i;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(i);break}o[2]&&c.ops.pop(),c.trys.pop();continue}i=t.call(e,c);}catch(e){i=[6,e],r=0;}finally{n=o=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,a])}}};Object.defineProperty(t,"__esModule",{value:!0});var o="browser-tabs-lock-key";function i(e){return new Promise((function(t){return setTimeout(t,e)}))}function c(e){for(var t="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",n="",r=0;r<e;r++){n+=t[Math.floor(Math.random()*t.length)];}return n}var a=function(){function e(){this.acquiredIatSet=new Set,this.id=Date.now().toString()+c(15),this.acquireLock=this.acquireLock.bind(this),this.releaseLock=this.releaseLock.bind(this),this.releaseLock__private__=this.releaseLock__private__.bind(this),this.waitForSomethingToChange=this.waitForSomethingToChange.bind(this),this.refreshLockWhileAcquired=this.refreshLockWhileAcquired.bind(this),void 0===e.waiters&&(e.waiters=[]);}return e.prototype.acquireLock=function(t,a){return void 0===a&&(a=5e3),n(this,void 0,void 0,(function(){var n,s,u,l,f,d;return r(this,(function(r){switch(r.label){case 0:n=Date.now()+c(4),s=Date.now()+a,u=o+"-"+t,l=window.localStorage,r.label=1;case 1:return Date.now()<s?[4,i(30)]:[3,8];case 2:return r.sent(),null!==l.getItem(u)?[3,5]:(f=this.id+"-"+t+"-"+n,[4,i(Math.floor(25*Math.random()))]);case 3:return r.sent(),l.setItem(u,JSON.stringify({id:this.id,iat:n,timeoutKey:f,timeAcquired:Date.now(),timeRefreshed:Date.now()})),[4,i(30)];case 4:return r.sent(),null!==(d=l.getItem(u))&&(d=JSON.parse(d)).id===this.id&&d.iat===n?(this.acquiredIatSet.add(n),this.refreshLockWhileAcquired(u,n),[2,!0]):[3,7];case 5:return e.lockCorrector(),[4,this.waitForSomethingToChange(s)];case 6:r.sent(),r.label=7;case 7:return n=Date.now()+c(4),[3,1];case 8:return [2,!1]}}))}))},e.prototype.refreshLockWhileAcquired=function(e,t){return n(this,void 0,void 0,(function(){var o=this;return r(this,(function(i){return setTimeout((function(){return n(o,void 0,void 0,(function(){var n,o;return r(this,(function(r){switch(r.label){case 0:return [4,Ac.default().lock(t)];case 1:return r.sent(),this.acquiredIatSet.has(t)?(n=window.localStorage,null===(o=n.getItem(e))?(Ac.default().unlock(t),[2]):((o=JSON.parse(o)).timeRefreshed=Date.now(),n.setItem(e,JSON.stringify(o)),Ac.default().unlock(t),this.refreshLockWhileAcquired(e,t),[2])):(Ac.default().unlock(t),[2])}}))}))}),1e3),[2]}))}))},e.prototype.waitForSomethingToChange=function(t){return n(this,void 0,void 0,(function(){return r(this,(function(n){switch(n.label){case 0:return [4,new Promise((function(n){var r=!1,o=Date.now(),i=!1;function c(){if(i||(window.removeEventListener("storage",c),e.removeFromWaiting(c),clearTimeout(a),i=!0),!r){r=!0;var t=50-(Date.now()-o);t>0?setTimeout(n,t):n();}}window.addEventListener("storage",c),e.addToWaiting(c);var a=setTimeout(c,Math.max(0,t-Date.now()));}))];case 1:return n.sent(),[2]}}))}))},e.addToWaiting=function(t){this.removeFromWaiting(t),void 0!==e.waiters&&e.waiters.push(t);},e.removeFromWaiting=function(t){void 0!==e.waiters&&(e.waiters=e.waiters.filter((function(e){return e!==t})));},e.notifyWaiters=function(){void 0!==e.waiters&&e.waiters.slice().forEach((function(e){return e()}));},e.prototype.releaseLock=function(e){return n(this,void 0,void 0,(function(){return r(this,(function(t){switch(t.label){case 0:return [4,this.releaseLock__private__(e)];case 1:return [2,t.sent()]}}))}))},e.prototype.releaseLock__private__=function(t){return n(this,void 0,void 0,(function(){var n,i,c;return r(this,(function(r){switch(r.label){case 0:return n=window.localStorage,i=o+"-"+t,null===(c=n.getItem(i))?[2]:(c=JSON.parse(c)).id!==this.id?[3,2]:[4,Ac.default().lock(c.iat)];case 1:r.sent(),this.acquiredIatSet.delete(c.iat),n.removeItem(i),Ac.default().unlock(c.iat),e.notifyWaiters(),r.label=2;case 2:return [2]}}))}))},e.lockCorrector=function(){for(var t=Date.now()-5e3,n=window.localStorage,r=Object.keys(n),i=!1,c=0;c<r.length;c++){var a=r[c];if(a.includes(o)){var s=n.getItem(a);null!==s&&(void 0===(s=JSON.parse(s)).timeRefreshed&&s.timeAcquired<t||void 0!==s.timeRefreshed&&s.timeRefreshed<t)&&(n.removeItem(a),i=!0);}}i&&e.notifyWaiters();},e.waiters=void 0,e}();t.default=a;})),Xc=u(Pc),Fc={timeoutInSeconds:60},Kc=["login_required","consent_required","interaction_required","account_selection_required","access_denied"],Nc={name:"auth0-spa-js",version:"1.22.6"},Uc=function(){return Date.now()},Dc=function(e){function n(t,r){var o=e.call(this,r)||this;return o.error=t,o.error_description=r,Object.setPrototypeOf(o,n.prototype),o}return t(n,e),n.fromPayload=function(e){return new n(e.error,e.error_description)},n}(Error),Hc=function(e){function n(t,r,o,i){void 0===i&&(i=null);var c=e.call(this,t,r)||this;return c.state=o,c.appState=i,Object.setPrototypeOf(c,n.prototype),c}return t(n,e),n}(Dc),Yc=function(e){function n(){var t=e.call(this,"timeout","Timeout")||this;return Object.setPrototypeOf(t,n.prototype),t}return t(n,e),n}(Dc),Jc=function(e){function n(t){var r=e.call(this)||this;return r.popup=t,Object.setPrototypeOf(r,n.prototype),r}return t(n,e),n}(Yc),Vc=function(e){function n(t){var r=e.call(this,"cancelled","Popup closed")||this;return r.popup=t,Object.setPrototypeOf(r,n.prototype),r}return t(n,e),n}(Dc),zc=function(e){function n(t,r,o){var i=e.call(this,t,r)||this;return i.mfa_token=o,Object.setPrototypeOf(i,n.prototype),i}return t(n,e),n}(Dc),Mc=function(e){function n(t,r){var o=e.call(this,"missing_refresh_token","Missing Refresh Token (audience: '".concat(ia(t,["default"]),"', scope: '").concat(ia(r),"')"))||this;return o.audience=t,o.scope=r,Object.setPrototypeOf(o,n.prototype),o}return t(n,e),n}(Dc),Bc=function(e){return new Promise((function(t,n){var r,o=setInterval((function(){e.popup&&e.popup.closed&&(clearInterval(o),clearTimeout(i),window.removeEventListener("message",r,!1),n(new Vc(e.popup)));}),1e3),i=setTimeout((function(){clearInterval(o),n(new Jc(e.popup)),window.removeEventListener("message",r,!1);}),1e3*(e.timeoutInSeconds||60));r=function(c){if(c.data&&"authorization_response"===c.data.type){if(clearTimeout(i),clearInterval(o),window.removeEventListener("message",r,!1),e.popup.close(),c.data.response.error)return n(Dc.fromPayload(c.data.response));t(c.data.response);}},window.addEventListener("message",r);}))},Qc=function(){return window.crypto||window.msCrypto},qc=function(){var e=Qc();return e.subtle||e.webkitSubtle},$c=function(){var e="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.",t="";return Array.from(Qc().getRandomValues(new Uint8Array(43))).forEach((function(n){return t+=e[n%e.length]})),t},ea=function(e){return btoa(e)},ta=function(e){return Object.keys(e).filter((function(t){return void 0!==e[t]})).map((function(t){return encodeURIComponent(t)+"="+encodeURIComponent(e[t])})).join("&")},na=function(e){return o(void 0,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return t=qc().digest({name:"SHA-256"},(new TextEncoder).encode(e)),window.msCrypto?[2,new Promise((function(e,n){t.oncomplete=function(t){e(t.target.result);},t.onerror=function(e){n(e.error);},t.onabort=function(){n("The digest operation was aborted");};}))]:[4,t];case 1:return [2,n.sent()]}}))}))},ra=function(e){return function(e){return decodeURIComponent(atob(e).split("").map((function(e){return "%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)})).join(""))}(e.replace(/_/g,"/").replace(/-/g,"+"))},oa=function(e){var t=new Uint8Array(e);return function(e){var t={"+":"-","/":"_","=":""};return e.replace(/[+/=]/g,(function(e){return t[e]}))}(window.btoa(String.fromCharCode.apply(String,a([],c(Array.from(t)),!1))))};function ia(e,t){return void 0===t&&(t=[]),e&&!t.includes(e)?e:""}var ca=function(e,t){return o(void 0,void 0,void 0,(function(){var n,r;return i(this,(function(o){switch(o.label){case 0:return [4,(i=e,c=t,c=c||{},new Promise((function(e,t){var n=new XMLHttpRequest,r=[],o=[],a={},s=function(){return {ok:2==(n.status/100|0),statusText:n.statusText,status:n.status,url:n.responseURL,text:function(){return Promise.resolve(n.responseText)},json:function(){return Promise.resolve(n.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([n.response]))},clone:s,headers:{keys:function(){return r},entries:function(){return o},get:function(e){return a[e.toLowerCase()]},has:function(e){return e.toLowerCase()in a}}}};for(var u in n.open(c.method||"get",i,!0),n.onload=function(){n.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,(function(e,t,n){r.push(t=t.toLowerCase()),o.push([t,n]),a[t]=a[t]?a[t]+","+n:n;})),e(s());},n.onerror=t,n.withCredentials="include"==c.credentials,c.headers)n.setRequestHeader(u,c.headers[u]);n.send(c.body||null);})))];case 1:return n=o.sent(),r={ok:n.ok},[4,n.json()];case 2:return [2,(r.json=o.sent(),r)]}var i,c;}))}))},aa=function(e,t,n){return o(void 0,void 0,void 0,(function(){var r,o;return i(this,(function(i){return r=new AbortController,t.signal=r.signal,[2,Promise.race([ca(e,t),new Promise((function(e,t){o=setTimeout((function(){r.abort(),t(new Error("Timeout when executing 'fetch'"));}),n);}))]).finally((function(){clearTimeout(o);}))]}))}))},sa=function(e,t,n,r,c,a,s){return o(void 0,void 0,void 0,(function(){return i(this,(function(o){return [2,(i={auth:{audience:t,scope:n},timeout:c,fetchUrl:e,fetchOptions:r,useFormData:s},u=a,new Promise((function(e,t){var n=new MessageChannel;n.port1.onmessage=function(r){r.data.error?t(new Error(r.data.error)):e(r.data),n.port1.close();},u.postMessage(i,[n.port2]);})))];var i,u;}))}))},ua=function(e,t,n,r,c,a,s){return void 0===s&&(s=1e4),o(void 0,void 0,void 0,(function(){return i(this,(function(o){return c?[2,sa(e,t,n,r,s,c,a)]:[2,aa(e,r,s)]}))}))};function la(e,t,n,c,a,s,u){return o(this,void 0,void 0,(function(){var o,l,f,d,h,p,y,v,m;return i(this,(function(i){switch(i.label){case 0:o=null,f=0,i.label=1;case 1:if(!(f<3))return [3,6];i.label=2;case 2:return i.trys.push([2,4,,5]),[4,ua(e,n,c,a,s,u,t)];case 3:return l=i.sent(),o=null,[3,6];case 4:return d=i.sent(),o=d,[3,5];case 5:return f++,[3,1];case 6:if(o)throw o.message=o.message||"Failed to fetch",o;if(h=l.json,p=h.error,y=h.error_description,v=r(h,["error","error_description"]),!l.ok){if(m=y||"HTTP error. Unable to fetch ".concat(e),"mfa_required"===p)throw new zc(p,m,v.mfa_token);throw new Dc(p||"request_error",m)}return [2,v]}}))}))}function fa(e,t){var n=e.baseUrl,c=e.timeout,a=e.audience,s=e.scope,u=e.auth0Client,l=e.useFormData,f=r(e,["baseUrl","timeout","audience","scope","auth0Client","useFormData"]);return o(this,void 0,void 0,(function(){var e;return i(this,(function(r){switch(r.label){case 0:return e=l?ta(f):JSON.stringify(f),[4,la("".concat(n,"/oauth/token"),c,a||"default",s,{method:"POST",body:e,headers:{"Content-Type":l?"application/x-www-form-urlencoded":"application/json","Auth0-Client":btoa(JSON.stringify(u||Nc))}},t,l)];case 1:return [2,r.sent()]}}))}))}var da=function(e){return Array.from(new Set(e))},ha=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return da(e.join(" ").trim().split(/\s+/)).join(" ")},pa=function(){function e(e,t){void 0===t&&(t="@@auth0spajs@@"),this.prefix=t,this.client_id=e.client_id,this.scope=e.scope,this.audience=e.audience;}return e.prototype.toKey=function(){return "".concat(this.prefix,"::").concat(this.client_id,"::").concat(this.audience,"::").concat(this.scope)},e.fromKey=function(t){var n=c(t.split("::"),4),r=n[0],o=n[1],i=n[2];return new e({client_id:o,scope:n[3],audience:i},r)},e.fromCacheEntry=function(t){return new e({scope:t.scope,audience:t.audience,client_id:t.client_id})},e}(),ya=function(){function e(){}return e.prototype.set=function(e,t){localStorage.setItem(e,JSON.stringify(t));},e.prototype.get=function(e){var t=window.localStorage.getItem(e);if(t)try{return JSON.parse(t)}catch(e){return}},e.prototype.remove=function(e){localStorage.removeItem(e);},e.prototype.allKeys=function(){return Object.keys(window.localStorage).filter((function(e){return e.startsWith("@@auth0spajs@@")}))},e}(),va=function(){var e;this.enclosedCache=(e={},{set:function(t,n){e[t]=n;},get:function(t){var n=e[t];if(n)return n},remove:function(t){delete e[t];},allKeys:function(){return Object.keys(e)}});},ma=function(){function e(e,t,n){this.cache=e,this.keyManifest=t,this.nowProvider=n,this.nowProvider=this.nowProvider||Uc;}return e.prototype.get=function(e,t){var n;return void 0===t&&(t=0),o(this,void 0,void 0,(function(){var r,o,c,a,s;return i(this,(function(i){switch(i.label){case 0:return [4,this.cache.get(e.toKey())];case 1:return (r=i.sent())?[3,4]:[4,this.getCacheKeys()];case 2:return (o=i.sent())?(c=this.matchExistingCacheKey(e,o))?[4,this.cache.get(c)]:[3,4]:[2];case 3:r=i.sent(),i.label=4;case 4:return r?[4,this.nowProvider()]:[2];case 5:return a=i.sent(),s=Math.floor(a/1e3),r.expiresAt-t<s?r.body.refresh_token?(r.body={refresh_token:r.body.refresh_token},[4,this.cache.set(e.toKey(),r)]):[3,7]:[3,10];case 6:return i.sent(),[2,r.body];case 7:return [4,this.cache.remove(e.toKey())];case 8:return i.sent(),[4,null===(n=this.keyManifest)||void 0===n?void 0:n.remove(e.toKey())];case 9:return i.sent(),[2];case 10:return [2,r.body]}}))}))},e.prototype.set=function(e){var t;return o(this,void 0,void 0,(function(){var n,r;return i(this,(function(o){switch(o.label){case 0:return n=new pa({client_id:e.client_id,scope:e.scope,audience:e.audience}),[4,this.wrapCacheEntry(e)];case 1:return r=o.sent(),[4,this.cache.set(n.toKey(),r)];case 2:return o.sent(),[4,null===(t=this.keyManifest)||void 0===t?void 0:t.add(n.toKey())];case 3:return o.sent(),[2]}}))}))},e.prototype.clear=function(e){var t;return o(this,void 0,void 0,(function(){var n,r=this;return i(this,(function(c){switch(c.label){case 0:return [4,this.getCacheKeys()];case 1:return (n=c.sent())?[4,n.filter((function(t){return !e||t.includes(e)})).reduce((function(e,t){return o(r,void 0,void 0,(function(){return i(this,(function(n){switch(n.label){case 0:return [4,e];case 1:return n.sent(),[4,this.cache.remove(t)];case 2:return n.sent(),[2]}}))}))}),Promise.resolve())]:[2];case 2:return c.sent(),[4,null===(t=this.keyManifest)||void 0===t?void 0:t.clear()];case 3:return c.sent(),[2]}}))}))},e.prototype.clearSync=function(e){var t=this,n=this.cache.allKeys();n&&n.filter((function(t){return !e||t.includes(e)})).forEach((function(e){t.cache.remove(e);}));},e.prototype.wrapCacheEntry=function(e){return o(this,void 0,void 0,(function(){var t,n,r;return i(this,(function(o){switch(o.label){case 0:return [4,this.nowProvider()];case 1:return t=o.sent(),n=Math.floor(t/1e3)+e.expires_in,r=Math.min(n,e.decodedToken.claims.exp),[2,{body:e,expiresAt:r}]}}))}))},e.prototype.getCacheKeys=function(){var e;return o(this,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return this.keyManifest?[4,this.keyManifest.get()]:[3,2];case 1:return t=null===(e=n.sent())||void 0===e?void 0:e.keys,[3,4];case 2:return [4,this.cache.allKeys()];case 3:t=n.sent(),n.label=4;case 4:return [2,t]}}))}))},e.prototype.matchExistingCacheKey=function(e,t){return t.filter((function(t){var n=pa.fromKey(t),r=new Set(n.scope&&n.scope.split(" ")),o=e.scope.split(" "),i=n.scope&&o.reduce((function(e,t){return e&&r.has(t)}),!0);return "@@auth0spajs@@"===n.prefix&&n.client_id===e.client_id&&n.audience===e.audience&&i}))[0]},e}(),ba=function(){function e(e,t){this.storage=e,this.clientId=t,this.storageKey="".concat("a0.spajs.txs",".").concat(this.clientId),this.transaction=this.storage.get(this.storageKey);}return e.prototype.create=function(e){this.transaction=e,this.storage.save(this.storageKey,e,{daysUntilExpire:1});},e.prototype.get=function(){return this.transaction},e.prototype.remove=function(){delete this.transaction,this.storage.remove(this.storageKey);},e}(),ga=function(e){return "number"==typeof e},wa=["iss","aud","exp","nbf","iat","jti","azp","nonce","auth_time","at_hash","c_hash","acr","amr","sub_jwk","cnf","sip_from_tag","sip_date","sip_callid","sip_cseq_num","sip_via_branch","orig","dest","mky","events","toe","txn","rph","sid","vot","vtm"],Sa=function(e){if(!e.id_token)throw new Error("ID token is required but missing");var t=function(e){var t=e.split("."),n=c(t,3),r=n[0],o=n[1],i=n[2];if(3!==t.length||!r||!o||!i)throw new Error("ID token could not be decoded");var a=JSON.parse(ra(o)),s={__raw:e},u={};return Object.keys(a).forEach((function(e){s[e]=a[e],wa.includes(e)||(u[e]=a[e]);})),{encoded:{header:r,payload:o,signature:i},header:JSON.parse(ra(r)),claims:s,user:u}}(e.id_token);if(!t.claims.iss)throw new Error("Issuer (iss) claim must be a string present in the ID token");if(t.claims.iss!==e.iss)throw new Error('Issuer (iss) claim mismatch in the ID token; expected "'.concat(e.iss,'", found "').concat(t.claims.iss,'"'));if(!t.user.sub)throw new Error("Subject (sub) claim must be a string present in the ID token");if("RS256"!==t.header.alg)throw new Error('Signature algorithm of "'.concat(t.header.alg,'" is not supported. Expected the ID token to be signed with "RS256".'));if(!t.claims.aud||"string"!=typeof t.claims.aud&&!Array.isArray(t.claims.aud))throw new Error("Audience (aud) claim must be a string or array of strings present in the ID token");if(Array.isArray(t.claims.aud)){if(!t.claims.aud.includes(e.aud))throw new Error('Audience (aud) claim mismatch in the ID token; expected "'.concat(e.aud,'" but was not one of "').concat(t.claims.aud.join(", "),'"'));if(t.claims.aud.length>1){if(!t.claims.azp)throw new Error("Authorized Party (azp) claim must be a string present in the ID token when Audience (aud) claim has multiple values");if(t.claims.azp!==e.aud)throw new Error('Authorized Party (azp) claim mismatch in the ID token; expected "'.concat(e.aud,'", found "').concat(t.claims.azp,'"'))}}else if(t.claims.aud!==e.aud)throw new Error('Audience (aud) claim mismatch in the ID token; expected "'.concat(e.aud,'" but found "').concat(t.claims.aud,'"'));if(e.nonce){if(!t.claims.nonce)throw new Error("Nonce (nonce) claim must be a string present in the ID token");if(t.claims.nonce!==e.nonce)throw new Error('Nonce (nonce) claim mismatch in the ID token; expected "'.concat(e.nonce,'", found "').concat(t.claims.nonce,'"'))}if(e.max_age&&!ga(t.claims.auth_time))throw new Error("Authentication Time (auth_time) claim must be a number present in the ID token when Max Age (max_age) is specified");if(!ga(t.claims.exp))throw new Error("Expiration Time (exp) claim must be a number present in the ID token");if(!ga(t.claims.iat))throw new Error("Issued At (iat) claim must be a number present in the ID token");var n=e.leeway||60,r=new Date(e.now||Date.now()),o=new Date(0),i=new Date(0),a=new Date(0);if(a.setUTCSeconds(parseInt(t.claims.auth_time)+e.max_age+n),o.setUTCSeconds(t.claims.exp+n),i.setUTCSeconds(t.claims.nbf-n),r>o)throw new Error("Expiration Time (exp) claim error in the ID token; current time (".concat(r,") is after expiration time (").concat(o,")"));if(ga(t.claims.nbf)&&r<i)throw new Error("Not Before time (nbf) claim in the ID token indicates that this token can't be used just yet. Currrent time (".concat(r,") is before ").concat(i));if(ga(t.claims.auth_time)&&r>a)throw new Error("Authentication Time (auth_time) claim in the ID token indicates that too much time has passed since the last end-user authentication. Currrent time (".concat(r,") is after last auth at ").concat(a));if(e.organizationId){if(!t.claims.org_id)throw new Error("Organization ID (org_id) claim must be a string present in the ID token");if(e.organizationId!==t.claims.org_id)throw new Error('Organization ID (org_id) claim mismatch in the ID token; expected "'.concat(e.organizationId,'", found "').concat(t.claims.org_id,'"'))}return t},ka=l((function(e,t){var n=s&&s.__assign||function(){return n=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},n.apply(this,arguments)};function r(e,t){if(!t)return "";var n="; "+e;return !0===t?n:n+"="+t}function o(e,t,n){return encodeURIComponent(e).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/\(/g,"%28").replace(/\)/g,"%29")+"="+encodeURIComponent(t).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent)+function(e){if("number"==typeof e.expires){var t=new Date;t.setMilliseconds(t.getMilliseconds()+864e5*e.expires),e.expires=t;}return r("Expires",e.expires?e.expires.toUTCString():"")+r("Domain",e.domain)+r("Path",e.path)+r("Secure",e.secure)+r("SameSite",e.sameSite)}(n)}function i(e){for(var t={},n=e?e.split("; "):[],r=/(%[\dA-F]{2})+/gi,o=0;o<n.length;o++){var i=n[o].split("="),c=i.slice(1).join("=");'"'===c.charAt(0)&&(c=c.slice(1,-1));try{t[i[0].replace(r,decodeURIComponent)]=c.replace(r,decodeURIComponent);}catch(e){}}return t}function c(){return i(document.cookie)}function a(e,t,r){document.cookie=o(e,t,n({path:"/"},r));}t.__esModule=!0,t.encode=o,t.parse=i,t.getAll=c,t.get=function(e){return c()[e]},t.set=a,t.remove=function(e,t){a(e,"",n(n({},t),{expires:-1}));};}));u(ka),ka.encode,ka.parse,ka.getAll;var _a=ka.get,Ia=ka.set,Oa=ka.remove,xa={get:function(e){var t=_a(e);if(void 0!==t)return JSON.parse(t)},save:function(e,t,n){var r={};"https:"===window.location.protocol&&(r={secure:!0,sameSite:"none"}),(null==n?void 0:n.daysUntilExpire)&&(r.expires=n.daysUntilExpire),(null==n?void 0:n.cookieDomain)&&(r.domain=n.cookieDomain),Ia(e,JSON.stringify(t),r);},remove:function(e,t){var n={};(null==t?void 0:t.cookieDomain)&&(n.domain=t.cookieDomain),Oa(e,n);}},Ta={get:function(e){var t=xa.get(e);return t||xa.get("".concat("_legacy_").concat(e))},save:function(e,t,n){var r={};"https:"===window.location.protocol&&(r={secure:!0}),(null==n?void 0:n.daysUntilExpire)&&(r.expires=n.daysUntilExpire),Ia("".concat("_legacy_").concat(e),JSON.stringify(t),r),xa.save(e,t,n);},remove:function(e,t){var n={};(null==t?void 0:t.cookieDomain)&&(n.domain=t.cookieDomain),Oa(e,n),xa.remove(e,t),xa.remove("".concat("_legacy_").concat(e),t);}},Ca={get:function(e){if("undefined"!=typeof sessionStorage){var t=sessionStorage.getItem(e);if(void 0!==t)return JSON.parse(t)}},save:function(e,t){sessionStorage.setItem(e,JSON.stringify(t));},remove:function(e){sessionStorage.removeItem(e);}};function ja(e,t,n){var r=void 0===t?null:t,o=function(e,t){var n=atob(e);if(t){for(var r=new Uint8Array(n.length),o=0,i=n.length;o<i;++o)r[o]=n.charCodeAt(o);return String.fromCharCode.apply(null,new Uint16Array(r.buffer))}return n}(e,void 0!==n&&n),i=o.indexOf("\n",10)+1,c=o.substring(i)+(r?"//# sourceMappingURL="+r:""),a=new Blob([c],{type:"application/javascript"});return URL.createObjectURL(a)}var La,Ra,Wa,Za,Ea=(La="Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwohZnVuY3Rpb24oKXsidXNlIHN0cmljdCI7dmFyIHQ9ZnVuY3Rpb24oZSxyKXtyZXR1cm4gdD1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fHtfX3Byb3RvX186W119aW5zdGFuY2VvZiBBcnJheSYmZnVuY3Rpb24odCxlKXt0Ll9fcHJvdG9fXz1lfXx8ZnVuY3Rpb24odCxlKXtmb3IodmFyIHIgaW4gZSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZSxyKSYmKHRbcl09ZVtyXSl9LHQoZSxyKX07ZnVuY3Rpb24gZShlLHIpe2lmKCJmdW5jdGlvbiIhPXR5cGVvZiByJiZudWxsIT09cil0aHJvdyBuZXcgVHlwZUVycm9yKCJDbGFzcyBleHRlbmRzIHZhbHVlICIrU3RyaW5nKHIpKyIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbCIpO2Z1bmN0aW9uIG4oKXt0aGlzLmNvbnN0cnVjdG9yPWV9dChlLHIpLGUucHJvdG90eXBlPW51bGw9PT1yP09iamVjdC5jcmVhdGUocik6KG4ucHJvdG90eXBlPXIucHJvdG90eXBlLG5ldyBuKX12YXIgcj1mdW5jdGlvbigpe3JldHVybiByPU9iamVjdC5hc3NpZ258fGZ1bmN0aW9uKHQpe2Zvcih2YXIgZSxyPTEsbj1hcmd1bWVudHMubGVuZ3RoO3I8bjtyKyspZm9yKHZhciBvIGluIGU9YXJndW1lbnRzW3JdKU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLG8pJiYodFtvXT1lW29dKTtyZXR1cm4gdH0sci5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O2Z1bmN0aW9uIG4odCxlLHIsbil7cmV0dXJuIG5ldyhyfHwocj1Qcm9taXNlKSkoKGZ1bmN0aW9uKG8sYyl7ZnVuY3Rpb24gaSh0KXt0cnl7cyhuLm5leHQodCkpfWNhdGNoKHQpe2ModCl9fWZ1bmN0aW9uIGEodCl7dHJ5e3Mobi50aHJvdyh0KSl9Y2F0Y2godCl7Yyh0KX19ZnVuY3Rpb24gcyh0KXt2YXIgZTt0LmRvbmU/byh0LnZhbHVlKTooZT10LnZhbHVlLGUgaW5zdGFuY2VvZiByP2U6bmV3IHIoKGZ1bmN0aW9uKHQpe3QoZSl9KSkpLnRoZW4oaSxhKX1zKChuPW4uYXBwbHkodCxlfHxbXSkpLm5leHQoKSl9KSl9ZnVuY3Rpb24gbyh0LGUpe3ZhciByLG4sbyxjLGk9e2xhYmVsOjAsc2VudDpmdW5jdGlvbigpe2lmKDEmb1swXSl0aHJvdyBvWzFdO3JldHVybiBvWzFdfSx0cnlzOltdLG9wczpbXX07cmV0dXJuIGM9e25leHQ6YSgwKSx0aHJvdzphKDEpLHJldHVybjphKDIpfSwiZnVuY3Rpb24iPT10eXBlb2YgU3ltYm9sJiYoY1tTeW1ib2wuaXRlcmF0b3JdPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KSxjO2Z1bmN0aW9uIGEoYyl7cmV0dXJuIGZ1bmN0aW9uKGEpe3JldHVybiBmdW5jdGlvbihjKXtpZihyKXRocm93IG5ldyBUeXBlRXJyb3IoIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy4iKTtmb3IoO2k7KXRyeXtpZihyPTEsbiYmKG89MiZjWzBdP24ucmV0dXJuOmNbMF0/bi50aHJvd3x8KChvPW4ucmV0dXJuKSYmby5jYWxsKG4pLDApOm4ubmV4dCkmJiEobz1vLmNhbGwobixjWzFdKSkuZG9uZSlyZXR1cm4gbztzd2l0Y2gobj0wLG8mJihjPVsyJmNbMF0sby52YWx1ZV0pLGNbMF0pe2Nhc2UgMDpjYXNlIDE6bz1jO2JyZWFrO2Nhc2UgNDpyZXR1cm4gaS5sYWJlbCsrLHt2YWx1ZTpjWzFdLGRvbmU6ITF9O2Nhc2UgNTppLmxhYmVsKyssbj1jWzFdLGM9WzBdO2NvbnRpbnVlO2Nhc2UgNzpjPWkub3BzLnBvcCgpLGkudHJ5cy5wb3AoKTtjb250aW51ZTtkZWZhdWx0OmlmKCEobz1pLnRyeXMsKG89by5sZW5ndGg+MCYmb1tvLmxlbmd0aC0xXSl8fDYhPT1jWzBdJiYyIT09Y1swXSkpe2k9MDtjb250aW51ZX1pZigzPT09Y1swXSYmKCFvfHxjWzFdPm9bMF0mJmNbMV08b1szXSkpe2kubGFiZWw9Y1sxXTticmVha31pZig2PT09Y1swXSYmaS5sYWJlbDxvWzFdKXtpLmxhYmVsPW9bMV0sbz1jO2JyZWFrfWlmKG8mJmkubGFiZWw8b1syXSl7aS5sYWJlbD1vWzJdLGkub3BzLnB1c2goYyk7YnJlYWt9b1syXSYmaS5vcHMucG9wKCksaS50cnlzLnBvcCgpO2NvbnRpbnVlfWM9ZS5jYWxsKHQsaSl9Y2F0Y2godCl7Yz1bNix0XSxuPTB9ZmluYWxseXtyPW89MH1pZig1JmNbMF0pdGhyb3cgY1sxXTtyZXR1cm57dmFsdWU6Y1swXT9jWzFdOnZvaWQgMCxkb25lOiEwfX0oW2MsYV0pfX19ZnVuY3Rpb24gYyh0LGUpe3JldHVybiB2b2lkIDA9PT1lJiYoZT1bXSksdCYmIWUuaW5jbHVkZXModCk/dDoiIn12YXIgaT1mdW5jdGlvbih0KXtmdW5jdGlvbiByKGUsbil7dmFyIG89dC5jYWxsKHRoaXMsbil8fHRoaXM7cmV0dXJuIG8uZXJyb3I9ZSxvLmVycm9yX2Rlc2NyaXB0aW9uPW4sT2JqZWN0LnNldFByb3RvdHlwZU9mKG8sci5wcm90b3R5cGUpLG99cmV0dXJuIGUocix0KSxyLmZyb21QYXlsb2FkPWZ1bmN0aW9uKHQpe3JldHVybiBuZXcgcih0LmVycm9yLHQuZXJyb3JfZGVzY3JpcHRpb24pfSxyfShFcnJvcik7IWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIHIoZSxuLG8sYyl7dm9pZCAwPT09YyYmKGM9bnVsbCk7dmFyIGk9dC5jYWxsKHRoaXMsZSxuKXx8dGhpcztyZXR1cm4gaS5zdGF0ZT1vLGkuYXBwU3RhdGU9YyxPYmplY3Quc2V0UHJvdG90eXBlT2YoaSxyLnByb3RvdHlwZSksaX1lKHIsdCl9KGkpLGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIHIoZSl7dmFyIG49dC5jYWxsKHRoaXMpfHx0aGlzO3JldHVybiBuLnBvcHVwPWUsT2JqZWN0LnNldFByb3RvdHlwZU9mKG4sci5wcm90b3R5cGUpLG59ZShyLHQpfShmdW5jdGlvbih0KXtmdW5jdGlvbiByKCl7dmFyIGU9dC5jYWxsKHRoaXMsInRpbWVvdXQiLCJUaW1lb3V0Iil8fHRoaXM7cmV0dXJuIE9iamVjdC5zZXRQcm90b3R5cGVPZihlLHIucHJvdG90eXBlKSxlfXJldHVybiBlKHIsdCkscn0oaSkpLGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIHIoZSl7dmFyIG49dC5jYWxsKHRoaXMsImNhbmNlbGxlZCIsIlBvcHVwIGNsb3NlZCIpfHx0aGlzO3JldHVybiBuLnBvcHVwPWUsT2JqZWN0LnNldFByb3RvdHlwZU9mKG4sci5wcm90b3R5cGUpLG59ZShyLHQpfShpKSxmdW5jdGlvbih0KXtmdW5jdGlvbiByKGUsbixvKXt2YXIgYz10LmNhbGwodGhpcyxlLG4pfHx0aGlzO3JldHVybiBjLm1mYV90b2tlbj1vLE9iamVjdC5zZXRQcm90b3R5cGVPZihjLHIucHJvdG90eXBlKSxjfWUocix0KX0oaSk7dmFyIGE9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gcihlLG4pe3ZhciBvPXQuY2FsbCh0aGlzLCJtaXNzaW5nX3JlZnJlc2hfdG9rZW4iLCJNaXNzaW5nIFJlZnJlc2ggVG9rZW4gKGF1ZGllbmNlOiAnIi5jb25jYXQoYyhlLFsiZGVmYXVsdCJdKSwiJywgc2NvcGU6ICciKS5jb25jYXQoYyhuKSwiJykiKSl8fHRoaXM7cmV0dXJuIG8uYXVkaWVuY2U9ZSxvLnNjb3BlPW4sT2JqZWN0LnNldFByb3RvdHlwZU9mKG8sci5wcm90b3R5cGUpLG99cmV0dXJuIGUocix0KSxyfShpKSxzPXt9LHU9ZnVuY3Rpb24odCxlKXtyZXR1cm4iIi5jb25jYXQodCwifCIpLmNvbmNhdChlKX07YWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsKGZ1bmN0aW9uKHQpe3ZhciBlPXQuZGF0YSxjPWUudGltZW91dCxpPWUuYXV0aCxmPWUuZmV0Y2hVcmwsbD1lLmZldGNoT3B0aW9ucyxwPWUudXNlRm9ybURhdGEsaD1mdW5jdGlvbih0LGUpe3ZhciByPSJmdW5jdGlvbiI9PXR5cGVvZiBTeW1ib2wmJnRbU3ltYm9sLml0ZXJhdG9yXTtpZighcilyZXR1cm4gdDt2YXIgbixvLGM9ci5jYWxsKHQpLGk9W107dHJ5e2Zvcig7KHZvaWQgMD09PWV8fGUtLSA+MCkmJiEobj1jLm5leHQoKSkuZG9uZTspaS5wdXNoKG4udmFsdWUpfWNhdGNoKHQpe289e2Vycm9yOnR9fWZpbmFsbHl7dHJ5e24mJiFuLmRvbmUmJihyPWMucmV0dXJuKSYmci5jYWxsKGMpfWZpbmFsbHl7aWYobyl0aHJvdyBvLmVycm9yfX1yZXR1cm4gaX0odC5wb3J0cywxKVswXTtyZXR1cm4gbih2b2lkIDAsdm9pZCAwLHZvaWQgMCwoZnVuY3Rpb24oKXt2YXIgdCxlLG4seSx2LGIsZCx3LE8sXztyZXR1cm4gbyh0aGlzLChmdW5jdGlvbihvKXtzd2l0Y2goby5sYWJlbCl7Y2FzZSAwOm49KGU9aXx8e30pLmF1ZGllbmNlLHk9ZS5zY29wZSxvLmxhYmVsPTE7Y2FzZSAxOmlmKG8udHJ5cy5wdXNoKFsxLDcsLDhdKSwhKHY9cD8obT1sLmJvZHksaz1uZXcgVVJMU2VhcmNoUGFyYW1zKG0pLFA9e30say5mb3JFYWNoKChmdW5jdGlvbih0LGUpe1BbZV09dH0pKSxQKTpKU09OLnBhcnNlKGwuYm9keSkpLnJlZnJlc2hfdG9rZW4mJiJyZWZyZXNoX3Rva2VuIj09PXYuZ3JhbnRfdHlwZSl7aWYoYj1mdW5jdGlvbih0LGUpe3JldHVybiBzW3UodCxlKV19KG4seSksIWIpdGhyb3cgbmV3IGEobix5KTtsLmJvZHk9cD9uZXcgVVJMU2VhcmNoUGFyYW1zKHIocih7fSx2KSx7cmVmcmVzaF90b2tlbjpifSkpLnRvU3RyaW5nKCk6SlNPTi5zdHJpbmdpZnkocihyKHt9LHYpLHtyZWZyZXNoX3Rva2VuOmJ9KSl9ZD12b2lkIDAsImZ1bmN0aW9uIj09dHlwZW9mIEFib3J0Q29udHJvbGxlciYmKGQ9bmV3IEFib3J0Q29udHJvbGxlcixsLnNpZ25hbD1kLnNpZ25hbCksdz12b2lkIDAsby5sYWJlbD0yO2Nhc2UgMjpyZXR1cm4gby50cnlzLnB1c2goWzIsNCwsNV0pLFs0LFByb21pc2UucmFjZShbKGc9YyxuZXcgUHJvbWlzZSgoZnVuY3Rpb24odCl7cmV0dXJuIHNldFRpbWVvdXQodCxnKX0pKSksZmV0Y2goZixyKHt9LGwpKV0pXTtjYXNlIDM6cmV0dXJuIHc9by5zZW50KCksWzMsNV07Y2FzZSA0OnJldHVybiBPPW8uc2VudCgpLGgucG9zdE1lc3NhZ2Uoe2Vycm9yOk8ubWVzc2FnZX0pLFsyXTtjYXNlIDU6cmV0dXJuIHc/WzQsdy5qc29uKCldOihkJiZkLmFib3J0KCksaC5wb3N0TWVzc2FnZSh7ZXJyb3I6IlRpbWVvdXQgd2hlbiBleGVjdXRpbmcgJ2ZldGNoJyJ9KSxbMl0pO2Nhc2UgNjpyZXR1cm4odD1vLnNlbnQoKSkucmVmcmVzaF90b2tlbj8oZnVuY3Rpb24odCxlLHIpe3NbdShlLHIpXT10fSh0LnJlZnJlc2hfdG9rZW4sbix5KSxkZWxldGUgdC5yZWZyZXNoX3Rva2VuKTpmdW5jdGlvbih0LGUpe2RlbGV0ZSBzW3UodCxlKV19KG4seSksaC5wb3N0TWVzc2FnZSh7b2s6dy5vayxqc29uOnR9KSxbMyw4XTtjYXNlIDc6cmV0dXJuIF89by5zZW50KCksaC5wb3N0TWVzc2FnZSh7b2s6ITEsanNvbjp7ZXJyb3JfZGVzY3JpcHRpb246Xy5tZXNzYWdlfX0pLFszLDhdO2Nhc2UgODpyZXR1cm5bMl19dmFyIGcsbSxrLFB9KSl9KSl9KSl9KCk7Cgo=",Ra=null,Wa=!1,function(e){return Za=Za||ja(La,Ra,Wa),new Worker(Za,e)}),Ga={},Aa=function(){function e(e,t){this.cache=e,this.clientId=t,this.manifestKey=this.createManifestKeyFrom(this.clientId);}return e.prototype.add=function(e){var t;return o(this,void 0,void 0,(function(){var n,r;return i(this,(function(o){switch(o.label){case 0:return r=Set.bind,[4,this.cache.get(this.manifestKey)];case 1:return (n=new(r.apply(Set,[void 0,(null===(t=o.sent())||void 0===t?void 0:t.keys)||[]]))).add(e),[4,this.cache.set(this.manifestKey,{keys:a([],c(n),!1)})];case 2:return o.sent(),[2]}}))}))},e.prototype.remove=function(e){return o(this,void 0,void 0,(function(){var t,n;return i(this,(function(r){switch(r.label){case 0:return [4,this.cache.get(this.manifestKey)];case 1:return (t=r.sent())?((n=new Set(t.keys)).delete(e),n.size>0?[4,this.cache.set(this.manifestKey,{keys:a([],c(n),!1)})]:[3,3]):[3,5];case 2:case 4:return [2,r.sent()];case 3:return [4,this.cache.remove(this.manifestKey)];case 5:return [2]}}))}))},e.prototype.get=function(){return this.cache.get(this.manifestKey)},e.prototype.clear=function(){return this.cache.remove(this.manifestKey)},e.prototype.createManifestKeyFrom=function(e){return "".concat("@@auth0spajs@@","::").concat(e)},e}(),Pa=new Xc,Xa={memory:function(){return (new va).enclosedCache},localstorage:function(){return new ya}},Fa=function(e){return Xa[e]},Ka=function(){return !/Trident.*rv:11\.0/.test(navigator.userAgent)},Na=function(){function e(e){var t,n,c,a,s=this;if(this.options=e,this._releaseLockOnPageHide=function(){return o(s,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return [4,Pa.releaseLock("auth0.lock.getTokenSilently")];case 1:return e.sent(),window.removeEventListener("pagehide",this._releaseLockOnPageHide),[2]}}))}))},"undefined"!=typeof window&&function(){if(!Qc())throw new Error("For security reasons, `window.crypto` is required to run `auth0-spa-js`.");if(void 0===qc())throw new Error("\n      auth0-spa-js must run on a secure origin. See https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md#why-do-i-get-auth0-spa-js-must-run-on-a-secure-origin for more information.\n    ")}(),e.cache&&e.cacheLocation&&console.warn("Both `cache` and `cacheLocation` options have been specified in the Auth0Client configuration; ignoring `cacheLocation` and using `cache`."),e.cache)c=e.cache;else {if(this.cacheLocation=e.cacheLocation||"memory",!Fa(this.cacheLocation))throw new Error('Invalid cache location "'.concat(this.cacheLocation,'"'));c=Fa(this.cacheLocation)();}this.httpTimeoutMs=e.httpTimeoutInSeconds?1e3*e.httpTimeoutInSeconds:1e4,this.cookieStorage=!1===e.legacySameSiteCookie?xa:Ta,this.orgHintCookieName=(a=this.options.client_id,"auth0.".concat(a,".organization_hint")),this.isAuthenticatedCookieName=function(e){return "auth0.".concat(e,".is.authenticated")}(this.options.client_id),this.sessionCheckExpiryDays=e.sessionCheckExpiryDays||1;var u,l=e.useCookiesForTransactions?this.cookieStorage:Ca;this.scope=this.options.scope,this.transactionManager=new ba(l,this.options.client_id),this.nowProvider=this.options.nowProvider||Uc,this.cacheManager=new ma(c,c.allKeys?null:new Aa(c,this.options.client_id),this.nowProvider),this.domainUrl=(u=this.options.domain,/^https?:\/\//.test(u)?u:"https://".concat(u)),this.tokenIssuer=function(e,t){return e?e.startsWith("https://")?e:"https://".concat(e,"/"):"".concat(t,"/")}(this.options.issuer,this.domainUrl),this.defaultScope=ha("openid",void 0!==(null===(n=null===(t=this.options)||void 0===t?void 0:t.advancedOptions)||void 0===n?void 0:n.defaultScope)?this.options.advancedOptions.defaultScope:"openid profile email"),this.options.useRefreshTokens&&(this.scope=ha(this.scope,"offline_access")),"undefined"!=typeof window&&window.Worker&&this.options.useRefreshTokens&&"memory"===this.cacheLocation&&Ka()&&(this.worker=new Ea),this.customOptions=function(e){return e.advancedOptions,e.audience,e.auth0Client,e.authorizeTimeoutInSeconds,e.cacheLocation,e.cache,e.client_id,e.domain,e.issuer,e.leeway,e.max_age,e.nowProvider,e.redirect_uri,e.scope,e.useRefreshTokens,e.useRefreshTokensFallback,e.useCookiesForTransactions,e.useFormData,r(e,["advancedOptions","audience","auth0Client","authorizeTimeoutInSeconds","cacheLocation","cache","client_id","domain","issuer","leeway","max_age","nowProvider","redirect_uri","scope","useRefreshTokens","useRefreshTokensFallback","useCookiesForTransactions","useFormData"])}(e),this.useRefreshTokensFallback=!1!==this.options.useRefreshTokensFallback;}return e.prototype._url=function(e){var t=encodeURIComponent(btoa(JSON.stringify(this.options.auth0Client||Nc)));return "".concat(this.domainUrl).concat(e,"&auth0Client=").concat(t)},e.prototype._getParams=function(e,t,o,i,c){var a=this.options;a.useRefreshTokens,a.useCookiesForTransactions,a.useFormData,a.auth0Client,a.cacheLocation,a.advancedOptions,a.detailedResponse,a.nowProvider,a.authorizeTimeoutInSeconds,a.legacySameSiteCookie,a.sessionCheckExpiryDays,a.domain,a.leeway,a.httpTimeoutInSeconds;var s=r(a,["useRefreshTokens","useCookiesForTransactions","useFormData","auth0Client","cacheLocation","advancedOptions","detailedResponse","nowProvider","authorizeTimeoutInSeconds","legacySameSiteCookie","sessionCheckExpiryDays","domain","leeway","httpTimeoutInSeconds"]);return n(n(n({},s),e),{scope:ha(this.defaultScope,this.scope,e.scope),response_type:"code",response_mode:"query",state:t,nonce:o,redirect_uri:c||this.options.redirect_uri,code_challenge:i,code_challenge_method:"S256"})},e.prototype._authorizeUrl=function(e){return this._url("/authorize?".concat(ta(e)))},e.prototype._verifyIdToken=function(e,t,n){return o(this,void 0,void 0,(function(){var r;return i(this,(function(o){switch(o.label){case 0:return [4,this.nowProvider()];case 1:return r=o.sent(),[2,Sa({iss:this.tokenIssuer,aud:this.options.client_id,id_token:e,nonce:t,organizationId:n,leeway:this.options.leeway,max_age:this._parseNumber(this.options.max_age),now:r})]}}))}))},e.prototype._parseNumber=function(e){return "string"!=typeof e?e:parseInt(e,10)||void 0},e.prototype._processOrgIdHint=function(e){e?this.cookieStorage.save(this.orgHintCookieName,e,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}):this.cookieStorage.remove(this.orgHintCookieName,{cookieDomain:this.options.cookieDomain});},e.prototype.buildAuthorizeUrl=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,o,c,a,s,u,l,f,d,h,p,y;return i(this,(function(i){switch(i.label){case 0:return t=e.redirect_uri,o=e.appState,c=r(e,["redirect_uri","appState"]),a=ea($c()),s=ea($c()),u=$c(),[4,na(u)];case 1:return l=i.sent(),f=oa(l),d=e.fragment?"#".concat(e.fragment):"",h=this._getParams(c,a,s,f,t),p=this._authorizeUrl(h),y=e.organization||this.options.organization,this.transactionManager.create(n({nonce:s,code_verifier:u,appState:o,scope:h.scope,audience:h.audience||"default",redirect_uri:h.redirect_uri,state:a},y&&{organizationId:y})),[2,p+d]}}))}))},e.prototype.loginWithPopup=function(e,t){return o(this,void 0,void 0,(function(){var o,c,a,s,u,l,f,d,h,p,y,v,m;return i(this,(function(i){switch(i.label){case 0:if(e=e||{},!(t=t||{}).popup&&(t.popup=function(e){var t=window.screenX+(window.innerWidth-400)/2,n=window.screenY+(window.innerHeight-600)/2;return window.open(e,"auth0:authorize:popup","left=".concat(t,",top=").concat(n,",width=").concat(400,",height=").concat(600,",resizable,scrollbars=yes,status=1"))}(""),!t.popup))throw new Error("Unable to open a popup for loginWithPopup - window.open returned `null`");return o=r(e,[]),c=ea($c()),a=ea($c()),s=$c(),[4,na(s)];case 1:return u=i.sent(),l=oa(u),f=this._getParams(o,c,a,l,this.options.redirect_uri||window.location.origin),d=this._authorizeUrl(n(n({},f),{response_mode:"web_message"})),t.popup.location.href=d,[4,Bc(n(n({},t),{timeoutInSeconds:t.timeoutInSeconds||this.options.authorizeTimeoutInSeconds||60}))];case 2:if(h=i.sent(),c!==h.state)throw new Error("Invalid state");return [4,fa({audience:f.audience,scope:f.scope,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:s,code:h.code,grant_type:"authorization_code",redirect_uri:f.redirect_uri,auth0Client:this.options.auth0Client,useFormData:this.options.useFormData,timeout:this.httpTimeoutMs},this.worker)];case 3:return p=i.sent(),y=e.organization||this.options.organization,[4,this._verifyIdToken(p.id_token,a,y)];case 4:return v=i.sent(),m=n(n({},p),{decodedToken:v,scope:f.scope,audience:f.audience||"default",client_id:this.options.client_id}),[4,this.cacheManager.set(m)];case 5:return i.sent(),this.cookieStorage.save(this.isAuthenticatedCookieName,!0,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}),this._processOrgIdHint(v.claims.org_id),[2]}}))}))},e.prototype.getUser=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,r;return i(this,(function(o){switch(o.label){case 0:return t=e.audience||this.options.audience||"default",n=ha(this.defaultScope,this.scope,e.scope),[4,this.cacheManager.get(new pa({client_id:this.options.client_id,audience:t,scope:n}))];case 1:return [2,(r=o.sent())&&r.decodedToken&&r.decodedToken.user]}}))}))},e.prototype.getIdTokenClaims=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,r;return i(this,(function(o){switch(o.label){case 0:return t=e.audience||this.options.audience||"default",n=ha(this.defaultScope,this.scope,e.scope),[4,this.cacheManager.get(new pa({client_id:this.options.client_id,audience:t,scope:n}))];case 1:return [2,(r=o.sent())&&r.decodedToken&&r.decodedToken.claims]}}))}))},e.prototype.loginWithRedirect=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,o;return i(this,(function(i){switch(i.label){case 0:return t=e.redirectMethod,n=r(e,["redirectMethod"]),[4,this.buildAuthorizeUrl(n)];case 1:return o=i.sent(),window.location[t||"assign"](o),[2]}}))}))},e.prototype.handleRedirectCallback=function(e){return void 0===e&&(e=window.location.href),o(this,void 0,void 0,(function(){var t,r,o,a,s,u,l,f,d,h;return i(this,(function(i){switch(i.label){case 0:if(0===(t=e.split("?").slice(1)).length)throw new Error("There are no query params available for parsing.");if(r=function(e){e.indexOf("#")>-1&&(e=e.substr(0,e.indexOf("#")));var t=e.split("&"),n={};return t.forEach((function(e){var t=c(e.split("="),2),r=t[0],o=t[1];n[r]=decodeURIComponent(o);})),n.expires_in&&(n.expires_in=parseInt(n.expires_in)),n}(t.join("")),o=r.state,a=r.code,s=r.error,u=r.error_description,!(l=this.transactionManager.get()))throw new Error("Invalid state");if(this.transactionManager.remove(),s)throw new Hc(s,u,o,l.appState);if(!l.code_verifier||l.state&&l.state!==o)throw new Error("Invalid state");return f={audience:l.audience,scope:l.scope,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:l.code_verifier,grant_type:"authorization_code",code:a,auth0Client:this.options.auth0Client,useFormData:this.options.useFormData,timeout:this.httpTimeoutMs},void 0!==l.redirect_uri&&(f.redirect_uri=l.redirect_uri),[4,fa(f,this.worker)];case 1:return d=i.sent(),[4,this._verifyIdToken(d.id_token,l.nonce,l.organizationId)];case 2:return h=i.sent(),[4,this.cacheManager.set(n(n(n(n({},d),{decodedToken:h,audience:l.audience,scope:l.scope}),d.scope?{oauthTokenScope:d.scope}:null),{client_id:this.options.client_id}))];case 3:return i.sent(),this.cookieStorage.save(this.isAuthenticatedCookieName,!0,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}),this._processOrgIdHint(h.claims.org_id),[2,{appState:l.appState}]}}))}))},e.prototype.checkSession=function(e){return o(this,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:if(!this.cookieStorage.get(this.isAuthenticatedCookieName)){if(!this.cookieStorage.get("auth0.is.authenticated"))return [2];this.cookieStorage.save(this.isAuthenticatedCookieName,!0,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}),this.cookieStorage.remove("auth0.is.authenticated");}n.label=1;case 1:return n.trys.push([1,3,,4]),[4,this.getTokenSilently(e)];case 2:return n.sent(),[3,4];case 3:if(t=n.sent(),!Kc.includes(t.error))throw t;return [3,4];case 4:return [2]}}))}))},e.prototype.getTokenSilently=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,o,c,a,s=this;return i(this,(function(i){switch(i.label){case 0:return t=n(n({audience:this.options.audience,ignoreCache:!1},e),{scope:ha(this.defaultScope,this.scope,e.scope)}),o=t.ignoreCache,c=r(t,["ignoreCache"]),[4,(u=function(){return s._getTokenSilently(n({ignoreCache:o},c))},l="".concat(this.options.client_id,"::").concat(c.audience,"::").concat(c.scope),f=Ga[l],f||(f=u().finally((function(){delete Ga[l],f=null;})),Ga[l]=f),f)];case 1:return a=i.sent(),[2,e.detailedResponse?a:a.access_token]}var u,l,f;}))}))},e.prototype._getTokenSilently=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,c,a,s,u,l,f,d,h;return i(this,(function(p){switch(p.label){case 0:return t=e.ignoreCache,c=r(e,["ignoreCache"]),t?[3,2]:[4,this._getEntryFromCache({scope:c.scope,audience:c.audience||"default",client_id:this.options.client_id})];case 1:if(a=p.sent())return [2,a];p.label=2;case 2:return [4,(y=function(){return Pa.acquireLock("auth0.lock.getTokenSilently",5e3)},v=10,void 0===v&&(v=3),o(void 0,void 0,void 0,(function(){var e;return i(this,(function(t){switch(t.label){case 0:e=0,t.label=1;case 1:return e<v?[4,y()]:[3,4];case 2:if(t.sent())return [2,!0];t.label=3;case 3:return e++,[3,1];case 4:return [2,!1]}}))})))];case 3:if(!p.sent())return [3,15];p.label=4;case 4:return p.trys.push([4,,12,14]),window.addEventListener("pagehide",this._releaseLockOnPageHide),t?[3,6]:[4,this._getEntryFromCache({scope:c.scope,audience:c.audience||"default",client_id:this.options.client_id})];case 5:if(a=p.sent())return [2,a];p.label=6;case 6:return this.options.useRefreshTokens?[4,this._getTokenUsingRefreshToken(c)]:[3,8];case 7:return u=p.sent(),[3,10];case 8:return [4,this._getTokenFromIFrame(c)];case 9:u=p.sent(),p.label=10;case 10:return s=u,[4,this.cacheManager.set(n({client_id:this.options.client_id},s))];case 11:return p.sent(),this.cookieStorage.save(this.isAuthenticatedCookieName,!0,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}),l=s.id_token,f=s.access_token,d=s.oauthTokenScope,h=s.expires_in,[2,n(n({id_token:l,access_token:f},d?{scope:d}:null),{expires_in:h})];case 12:return [4,Pa.releaseLock("auth0.lock.getTokenSilently")];case 13:return p.sent(),window.removeEventListener("pagehide",this._releaseLockOnPageHide),[7];case 14:return [3,16];case 15:throw new Yc;case 16:return [2]}var y,v;}))}))},e.prototype.getTokenWithPopup=function(e,t){return void 0===e&&(e={}),void 0===t&&(t={}),o(this,void 0,void 0,(function(){return i(this,(function(r){switch(r.label){case 0:return e.audience=e.audience||this.options.audience,e.scope=ha(this.defaultScope,this.scope,e.scope),t=n(n({},Fc),t),[4,this.loginWithPopup(e,t)];case 1:return r.sent(),[4,this.cacheManager.get(new pa({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id}))];case 2:return [2,r.sent().access_token]}}))}))},e.prototype.isAuthenticated=function(){return o(this,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return [4,this.getUser()];case 1:return [2,!!e.sent()]}}))}))},e.prototype.buildLogoutUrl=function(e){void 0===e&&(e={}),null!==e.client_id?e.client_id=e.client_id||this.options.client_id:delete e.client_id;var t=e.federated,n=r(e,["federated"]),o=t?"&federated":"";return this._url("/v2/logout?".concat(ta(n)))+o},e.prototype.logout=function(e){var t=this;void 0===e&&(e={});var n=e.localOnly,o=r(e,["localOnly"]);if(n&&o.federated)throw new Error("It is invalid to set both the `federated` and `localOnly` options to `true`");var i=function(){if(t.cookieStorage.remove(t.orgHintCookieName,{cookieDomain:t.options.cookieDomain}),t.cookieStorage.remove(t.isAuthenticatedCookieName,{cookieDomain:t.options.cookieDomain}),!n){var e=t.buildLogoutUrl(o);window.location.assign(e);}};if(this.options.cache)return this.cacheManager.clear().then((function(){return i()}));this.cacheManager.clearSync(),i();},e.prototype._getTokenFromIFrame=function(e){return o(this,void 0,void 0,(function(){var t,o,c,a,s,u,l,f,d,h,p,y,v,m,b,g,w;return i(this,(function(i){switch(i.label){case 0:return t=ea($c()),o=ea($c()),c=$c(),[4,na(c)];case 1:a=i.sent(),s=oa(a),u=r(e,["detailedResponse"]),l=this._getParams(u,t,o,s,e.redirect_uri||this.options.redirect_uri||window.location.origin),(f=this.cookieStorage.get(this.orgHintCookieName))&&!l.organization&&(l.organization=f),d=this._authorizeUrl(n(n({},l),{prompt:"none",response_mode:"web_message"})),i.label=2;case 2:if(i.trys.push([2,6,,7]),window.crossOriginIsolated)throw new Dc("login_required","The application is running in a Cross-Origin Isolated context, silently retrieving a token without refresh token is not possible.");return h=e.timeoutInSeconds||this.options.authorizeTimeoutInSeconds,[4,(S=d,k=this.domainUrl,_=h,void 0===_&&(_=60),new Promise((function(e,t){var n=window.document.createElement("iframe");n.setAttribute("width","0"),n.setAttribute("height","0"),n.style.display="none";var r,o=function(){window.document.body.contains(n)&&(window.document.body.removeChild(n),window.removeEventListener("message",r,!1));},i=setTimeout((function(){t(new Yc),o();}),1e3*_);r=function(n){if(n.origin==k&&n.data&&"authorization_response"===n.data.type){var c=n.source;c&&c.close(),n.data.response.error?t(Dc.fromPayload(n.data.response)):e(n.data.response),clearTimeout(i),window.removeEventListener("message",r,!1),setTimeout(o,2e3);}},window.addEventListener("message",r,!1),window.document.body.appendChild(n),n.setAttribute("src",S);})))];case 3:if(p=i.sent(),t!==p.state)throw new Error("Invalid state");return y=e.scope,v=e.audience,m=r(e,["scope","audience","redirect_uri","ignoreCache","timeoutInSeconds","detailedResponse"]),[4,fa(n(n(n({},this.customOptions),m),{scope:y,audience:v,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:c,code:p.code,grant_type:"authorization_code",redirect_uri:l.redirect_uri,auth0Client:this.options.auth0Client,useFormData:this.options.useFormData,timeout:m.timeout||this.httpTimeoutMs}),this.worker)];case 4:return b=i.sent(),[4,this._verifyIdToken(b.id_token,o)];case 5:return g=i.sent(),this._processOrgIdHint(g.claims.org_id),[2,n(n({},b),{decodedToken:g,scope:l.scope,oauthTokenScope:b.scope,audience:l.audience||"default"})];case 6:throw "login_required"===(w=i.sent()).error&&this.logout({localOnly:!0}),w;case 7:return [2]}var S,k,_;}))}))},e.prototype._getTokenUsingRefreshToken=function(e){return o(this,void 0,void 0,(function(){var t,o,c,a,s,u,l,f,d;return i(this,(function(i){switch(i.label){case 0:return e.scope=ha(this.defaultScope,this.options.scope,e.scope),[4,this.cacheManager.get(new pa({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id}))];case 1:return (t=i.sent())&&t.refresh_token||this.worker?[3,4]:this.useRefreshTokensFallback?[4,this._getTokenFromIFrame(e)]:[3,3];case 2:return [2,i.sent()];case 3:throw new Mc(e.audience||"default",e.scope);case 4:o=e.redirect_uri||this.options.redirect_uri||window.location.origin,a=e.scope,s=e.audience,u=r(e,["scope","audience","ignoreCache","timeoutInSeconds","detailedResponse"]),l="number"==typeof e.timeoutInSeconds?1e3*e.timeoutInSeconds:null,i.label=5;case 5:return i.trys.push([5,7,,10]),[4,fa(n(n(n(n(n({},this.customOptions),u),{audience:s,scope:a,baseUrl:this.domainUrl,client_id:this.options.client_id,grant_type:"refresh_token",refresh_token:t&&t.refresh_token,redirect_uri:o}),l&&{timeout:l}),{auth0Client:this.options.auth0Client,useFormData:this.options.useFormData,timeout:this.httpTimeoutMs}),this.worker)];case 6:return c=i.sent(),[3,10];case 7:return ((f=i.sent()).message.indexOf("Missing Refresh Token")>-1||f.message&&f.message.indexOf("invalid refresh token")>-1)&&this.useRefreshTokensFallback?[4,this._getTokenFromIFrame(e)]:[3,9];case 8:return [2,i.sent()];case 9:throw f;case 10:return [4,this._verifyIdToken(c.id_token)];case 11:return d=i.sent(),[2,n(n({},c),{decodedToken:d,scope:e.scope,oauthTokenScope:c.scope,audience:e.audience||"default"})]}}))}))},e.prototype._getEntryFromCache=function(e){var t=e.scope,r=e.audience,c=e.client_id;return o(this,void 0,void 0,(function(){var e,o,a,s,u;return i(this,(function(i){switch(i.label){case 0:return [4,this.cacheManager.get(new pa({scope:t,audience:r,client_id:c}),60)];case 1:return (e=i.sent())&&e.access_token?(o=e.id_token,a=e.access_token,s=e.oauthTokenScope,u=e.expires_in,[2,n(n({id_token:o,access_token:a},s?{scope:s}:null),{expires_in:u})]):[2]}}))}))},e}();function Da(e){return o(this,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return [4,(t=new Na(e)).checkSession()];case 1:return n.sent(),[2,t]}}))}))}

    const config = {
        domain: "dev-um5xka1f3etzqoxp.us.auth0.com",
        clientId: "PBieb90pBxFKqS9mKJbM9X5JViKccFha"
    };

    let auth0Client;

    async function createClient() {
      auth0Client = await Da({
        domain: config.domain,
        client_id: config.clientId
      });
    }

    async function loginWithPopup() {
      try {
        await createClient();
        await auth0Client.loginWithPopup();
        user.set(await auth0Client.getUser());
        const claims = await auth0Client.getIdTokenClaims();
        const id_token = await claims.__raw;
        jwt_token.set(id_token);
        console.log(id_token);

        

      } catch (e) {
        console.error(e);
      } 
    }

    function logout() {
      try {
        user.set({});
        jwt_token.set("");
        auth0Client.logout();
      } catch (e) {
        console.error(e);
      } 
      push("/"); // return to main page
    }

    const auth = {
      createClient,
      loginWithPopup,
      logout
    };

    /* src\App.svelte generated by Svelte v3.59.1 */
    const file = "src\\App.svelte";

    // (16:3) {#if $isAuthenticated}
    function create_if_block_2(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Home";
    			attr_dev(a, "class", "navbar-brand");
    			attr_dev(a, "href", "#/home");
    			add_location(a, file, 16, 4, 412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(16:3) {#if $isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    // (19:3) {#if $isAuthenticated && $user.user_roles && $user.user_roles.includes("admin")}
    function create_if_block_1(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Players";
    			attr_dev(a, "class", "navbar-brand");
    			attr_dev(a, "href", "#/players");
    			add_location(a, file, 19, 4, 559);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:3) {#if $isAuthenticated && $user.user_roles && $user.user_roles.includes(\\\"admin\\\")}",
    		ctx
    	});

    	return block;
    }

    // (45:5) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Log In";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file, 45, 6, 1309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", auth.loginWithPopup, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(45:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:5) {#if $isAuthenticated}
    function create_if_block(ctx) {
    	let span;
    	let t0_value = /*$user*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Log Out";
    			attr_dev(span, "class", "navbar-text me-2");
    			add_location(span, file, 36, 6, 1095);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file, 39, 6, 1170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", auth.logout, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 2 && t0_value !== (t0_value = /*$user*/ ctx[1].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(36:5) {#if $isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let title;
    	let t1;
    	let div3;
    	let nav;
    	let div2;
    	let t2;
    	let show_if = /*$isAuthenticated*/ ctx[0] && /*$user*/ ctx[1].user_roles && /*$user*/ ctx[1].user_roles.includes("admin");
    	let t3;
    	let a;
    	let t5;
    	let button;
    	let span;
    	let t6;
    	let div1;
    	let div0;
    	let t7;
    	let div4;
    	let router;
    	let current;
    	let if_block0 = /*$isAuthenticated*/ ctx[0] && create_if_block_2(ctx);
    	let if_block1 = show_if && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$isAuthenticated*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			title = element("title");
    			title.textContent = "GuessIt";
    			t1 = space();
    			div3 = element("div");
    			nav = element("nav");
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			a = element("a");
    			a.textContent = "Leaderboard";
    			t5 = space();
    			button = element("button");
    			span = element("span");
    			t6 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if_block2.c();
    			t7 = space();
    			div4 = element("div");
    			create_component(router.$$.fragment);
    			add_location(title, file, 7, 0, 186);
    			attr_dev(a, "class", "navbar-brand");
    			attr_dev(a, "href", "#/leaderboards");
    			add_location(a, file, 21, 3, 626);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 31, 4, 916);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarNav");
    			attr_dev(button, "aria-controls", "navbarNav");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 22, 3, 692);
    			attr_dev(div0, "class", "d-flex ms-auto");
    			add_location(div0, file, 34, 4, 1030);
    			attr_dev(div1, "class", "collapse navbar-collapse");
    			attr_dev(div1, "id", "navbarNav");
    			add_location(div1, file, 33, 3, 971);
    			attr_dev(div2, "class", "container-fluid");
    			add_location(div2, file, 14, 2, 350);
    			attr_dev(nav, "class", "navbar navbar-expand-lg");
    			set_style(nav, "background-color", "transparent");
    			set_style(nav, "border-bottom", "1px solid white");
    			add_location(nav, file, 10, 1, 229);
    			attr_dev(div3, "id", "app");
    			add_location(div3, file, 9, 0, 212);
    			attr_dev(div4, "class", "container mt-3");
    			add_location(div4, file, 57, 0, 1499);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, nav);
    			append_dev(nav, div2);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, a);
    			append_dev(div2, t5);
    			append_dev(div2, button);
    			append_dev(button, span);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			if_block2.m(div0, null);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(router, div4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$isAuthenticated*/ ctx[0]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div2, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*$isAuthenticated, $user*/ 3) show_if = /*$isAuthenticated*/ ctx[0] && /*$user*/ ctx[1].user_roles && /*$user*/ ctx[1].user_roles.includes("admin");

    			if (show_if) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div2, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div4);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $isAuthenticated;
    	let $user;
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(0, $isAuthenticated = $$value));
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		routes,
    		isAuthenticated,
    		user,
    		auth,
    		$isAuthenticated,
    		$user
    	});

    	return [$isAuthenticated, $user];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
