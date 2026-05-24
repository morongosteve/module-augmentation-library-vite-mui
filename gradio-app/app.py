"""
Gradio ML Interface
Web-based UI for interacting with ML models
"""

import gradio as gr
from src.ml_interface import MLInterface

# Initialize ML interface
ml_interface = MLInterface()

# Get device info
device_info = ml_interface.get_device_info()

# Available models
AVAILABLE_MODELS = ml_interface.list_available_models()


def create_model_selector():
    """Create model selection interface"""

    def format_model_choice(model_info):
        """Format model for dropdown"""
        return f"{model_info['name']} ({model_info['size']})"

    def load_model_wrapper(model_choice, use_4bit, progress=gr.Progress()):
        """Wrapper for model loading with progress"""
        # Find model_id from choice
        model_id = None
        for model in AVAILABLE_MODELS:
            if format_model_choice(model) == model_choice:
                model_id = model["model_id"]
                break

        if model_id is None:
            return "❌ Model not found", ""

        return ml_interface.load_model(model_id, use_4bit, progress)

    with gr.Column() as model_selector:
        gr.Markdown("## 📦 Model Management")

        model_dropdown = gr.Dropdown(
            choices=[format_model_choice(m) for m in AVAILABLE_MODELS],
            label="Select Model",
            info="Choose a pre-configured model to load",
        )

        use_4bit_checkbox = gr.Checkbox(
            label="Use 4-bit Quantization (CUDA only)",
            value=False,
            info="Reduces memory usage by ~75%, may slightly reduce quality",
        )

        load_btn = gr.Button("Load Model", variant="primary", size="lg")

        status_output = gr.Textbox(
            label="Status",
            lines=5,
            interactive=False,
        )

        device_output = gr.Code(
            label="Device Information",
            language="json",
            interactive=False,
        )

        # Display model details
        with gr.Accordion("📋 Model Details", open=False):
            model_details = gr.Markdown()

            def show_model_details(model_choice):
                if not model_choice:
                    return ""

                for model in AVAILABLE_MODELS:
                    if format_model_choice(model) == model_choice:
                        details = f"""
**Name:** {model['name']}

**Model ID:** `{model['model_id']}`

**Size:** {model['size']}

**Description:** {model['description']}

**Recommended For:** {model['recommended_for']}
"""
                        return details
                return ""

            model_dropdown.change(
                show_model_details,
                inputs=[model_dropdown],
                outputs=[model_details],
            )

        # Load model on button click
        load_btn.click(
            load_model_wrapper,
            inputs=[model_dropdown, use_4bit_checkbox],
            outputs=[status_output, device_output],
        )

    return model_selector


def create_chat_interface():
    """Create chat interface"""

    with gr.Column() as chat_interface:
        gr.Markdown("## 💬 Chat Interface")

        chatbot = gr.Chatbot(
            height=500,
            label="Conversation",
            show_label=True,
        )

        with gr.Row():
            msg = gr.Textbox(
                label="Your Message",
                placeholder="Type your message here...",
                lines=2,
                scale=4,
            )
            send_btn = gr.Button("Send", variant="primary", scale=1)

        with gr.Accordion("⚙️ Generation Settings", open=False):
            max_tokens = gr.Slider(
                minimum=32,
                maximum=1024,
                value=256,
                step=32,
                label="Max Tokens",
                info="Maximum number of tokens to generate",
            )

            temperature = gr.Slider(
                minimum=0.0,
                maximum=2.0,
                value=0.7,
                step=0.1,
                label="Temperature",
                info="Higher = more creative, Lower = more focused",
            )

            top_p = gr.Slider(
                minimum=0.0,
                maximum=1.0,
                value=0.9,
                step=0.05,
                label="Top P",
                info="Nucleus sampling threshold",
            )

        clear_btn = gr.Button("Clear Conversation")

        def respond(message, chat_history, max_tok, temp, top_p_val):
            """Handle chat response"""
            bot_message = ml_interface.chat(
                message,
                chat_history,
                max_tokens=max_tok,
                temperature=temp,
                top_p=top_p_val,
            )
            chat_history.append((message, bot_message))
            return "", chat_history

        # Send message
        send_btn.click(
            respond,
            inputs=[msg, chatbot, max_tokens, temperature, top_p],
            outputs=[msg, chatbot],
        )

        msg.submit(
            respond,
            inputs=[msg, chatbot, max_tokens, temperature, top_p],
            outputs=[msg, chatbot],
        )

        # Clear conversation
        clear_btn.click(lambda: [], outputs=[chatbot])

    return chat_interface


def create_text_generation_interface():
    """Create simple text generation interface"""

    with gr.Column() as text_gen:
        gr.Markdown("## ✍️ Text Generation")

        prompt_input = gr.Textbox(
            label="Prompt",
            placeholder="Enter your prompt here...",
            lines=5,
        )

        with gr.Row():
            with gr.Column(scale=1):
                gen_max_tokens = gr.Slider(
                    minimum=32,
                    maximum=1024,
                    value=256,
                    step=32,
                    label="Max Tokens",
                )

                gen_temperature = gr.Slider(
                    minimum=0.0,
                    maximum=2.0,
                    value=0.7,
                    step=0.1,
                    label="Temperature",
                )

                gen_top_p = gr.Slider(
                    minimum=0.0,
                    maximum=1.0,
                    value=0.9,
                    step=0.05,
                    label="Top P",
                )

                gen_top_k = gr.Slider(
                    minimum=1,
                    maximum=100,
                    value=50,
                    step=1,
                    label="Top K",
                )

            with gr.Column(scale=2):
                output_text = gr.Textbox(
                    label="Generated Text",
                    lines=15,
                    interactive=False,
                )

        generate_btn = gr.Button("Generate", variant="primary", size="lg")

        def generate_wrapper(prompt, max_tok, temp, top_p_val, top_k_val):
            """Wrapper for text generation"""
            return ml_interface.generate(
                prompt,
                max_tokens=max_tok,
                temperature=temp,
                top_p=top_p_val,
                top_k=top_k_val,
            )

        generate_btn.click(
            generate_wrapper,
            inputs=[prompt_input, gen_max_tokens, gen_temperature, gen_top_p, gen_top_k],
            outputs=[output_text],
        )

    return text_gen


def create_app():
    """Create main Gradio app"""

    with gr.Blocks(
        title="ML Interface - iOS Model Testing",
        theme=gr.themes.Soft(),
    ) as app:
        gr.Markdown(
            """
            # 🚀 ML Interface - iOS Model Testing & Conversion

            Test and evaluate models before deploying to iOS. This interface helps you:
            - Load and test models from Hugging Face
            - Evaluate model quality and performance
            - Determine optimal quantization settings
            - Prepare models for iOS conversion
            """
        )

        # Device info at top
        with gr.Accordion("💻 Device Information", open=True):
            gr.Markdown(
                f"""
                **Current Device:** `{device_info['current_device']}`
                **CUDA Available:** {device_info['cuda_available']}
                **MPS Available (Apple Silicon):** {device_info['mps_available']}
                **CPU Count:** {device_info['cpu_count']}
                """
            )

        with gr.Tabs() as tabs:
            with gr.TabItem("📦 Model Management"):
                create_model_selector()

            with gr.TabItem("💬 Chat"):
                create_chat_interface()

            with gr.TabItem("✍️ Text Generation"):
                create_text_generation_interface()

            with gr.TabItem("📚 Guide"):
                gr.Markdown(
                    """
                    ## Quick Start Guide

                    ### Step 1: Load a Model
                    1. Go to the "Model Management" tab
                    2. Select a model from the dropdown (start with TinyLlama for testing)
                    3. Optionally enable 4-bit quantization (CUDA only) to reduce memory
                    4. Click "Load Model" and wait for it to download and load

                    ### Step 2: Test the Model

                    **Chat Interface:**
                    1. Go to the "Chat" tab
                    2. Type a message and click "Send"
                    3. Adjust generation settings as needed

                    **Text Generation:**
                    1. Go to the "Text Generation" tab
                    2. Enter a prompt
                    3. Adjust parameters
                    4. Click "Generate"

                    ### Step 3: Prepare for iOS

                    Once you've tested a model and are satisfied:

                    **For GGUF (llama.rn):**
                    1. Find quantized GGUF version on Hugging Face
                    2. Add to `mobile/src/ml/modelConfigs.ts`
                    3. Update with Hugging Face URL

                    **For Core ML:**
                    1. Use the model conversion guide
                    2. Convert with `coremltools`
                    3. Add to iOS project

                    See the [Mobile README](../mobile/README.md) for more details.

                    ## Model Recommendations

                    ### For Testing
                    - **TinyLlama 1.1B** - Fastest to load, good for testing

                    ### For iOS Deployment
                    - **Llama 3.2 1B** - Best balance for iPhone 12+
                    - **Llama 3.2 3B** - Better quality for iPhone 13 Pro+
                    - **Phi-3 Mini** - Good alternative, efficient

                    ## Performance Tips

                    - Use 4-bit quantization to reduce memory by ~75%
                    - Lower temperature for more consistent output
                    - Reduce max tokens for faster generation
                    - Test on similar hardware to target iOS device

                    ## Next Steps

                    1. Test multiple models to find the best fit
                    2. Evaluate quality vs. size tradeoffs
                    3. Convert chosen model for iOS
                    4. Deploy to React Native app

                    For more information, see:
                    - [Model Conversion Guide](../mobile/docs/MODEL-CONVERSION.md)
                    - [iOS Setup Guide](../mobile/docs/iOS-SETUP.md)
                    """
                )

    return app


if __name__ == "__main__":
    app = create_app()
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True,
    )
