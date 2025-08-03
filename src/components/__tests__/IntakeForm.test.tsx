import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IntakeForm from '../IntakeForm';

// Mock the form submission
const mockOnSubmit = jest.fn();

describe('IntakeForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with all required fields', () => {
    render(<IntakeForm onSubmit={mockOnSubmit} />);
    
    // Check for main sections
    expect(screen.getByText('Patient Intake Form')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('How did you hear about us?')).toBeInTheDocument();
    expect(screen.getByText('Insurance Information')).toBeInTheDocument();
    expect(screen.getByText('Consent & Permissions')).toBeInTheDocument();
    
    // Check for required fields
    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<IntakeForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByText('Submit Form');
    await user.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
      expect(screen.getByText('Please select how you heard about us')).toBeInTheDocument();
      expect(screen.getByText('Please select your insurance provider')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<IntakeForm onSubmit={mockOnSubmit} />);
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/First Name/), 'John');
    await user.type(screen.getByLabelText(/Last Name/), 'Doe');
    await user.type(screen.getByLabelText(/Email Address/), 'john@example.com');
    await user.type(screen.getByLabelText(/Phone Number/), '5551234567');
    await user.type(screen.getByLabelText(/Date of Birth/), '1990-01-01');
    
    // Select attribution source
    const walkInRadio = screen.getByLabelText('Walk-in');
    await user.click(walkInRadio);
    
    // Select insurance provider
    const insuranceSelect = screen.getByLabelText(/Insurance Provider/);
    await user.selectOptions(insuranceSelect, 'vsp');
    
    // Check consent boxes
    const contactConsent = screen.getByLabelText(/consent to be contacted/);
    const dataConsent = screen.getByLabelText(/consent to the processing/);
    await user.click(contactConsent);
    await user.click(dataConsent);
    
    // Submit form
    const submitButton = screen.getByText('Submit Form');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '5551234567',
          dateOfBirth: '1990-01-01',
          attributionSource: 'walk-in',
          insuranceProvider: 'vsp',
          consentToContact: true,
          consentToDataProcessing: true,
          preferredLanguage: 'en'
        })
      );
    });
  });

  it('switches language correctly', async () => {
    render(<IntakeForm onSubmit={mockOnSubmit} />);
    
    // Click Spanish button
    const spanishButton = screen.getByText('Español');
    fireEvent.click(spanishButton);
    
    // Check that text has changed to Spanish
    expect(screen.getByText('Formulario de Admisión del Paciente')).toBeInTheDocument();
    expect(screen.getByText('Información Personal')).toBeInTheDocument();
    expect(screen.getByText('¿Cómo se enteró de nosotros?')).toBeInTheDocument();
  });

  it('shows insurance plan field when provider is selected', async () => {
    const user = userEvent.setup();
    render(<IntakeForm onSubmit={mockOnSubmit} />);
    
    // Select insurance provider
    const insuranceSelect = screen.getByLabelText(/Insurance Provider/);
    await user.selectOptions(insuranceSelect, 'vsp');
    
    // Check that insurance plan field appears
    expect(screen.getByLabelText(/Insurance Plan/)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<IntakeForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit form/i })).toBeDisabled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<IntakeForm onSubmit={mockOnSubmit} />);
    
    // Fill in other required fields
    await user.type(screen.getByLabelText(/First Name/), 'John');
    await user.type(screen.getByLabelText(/Last Name/), 'Doe');
    await user.type(screen.getByLabelText(/Phone Number/), '5551234567');
    await user.type(screen.getByLabelText(/Date of Birth/), '1990-01-01');
    
    // Enter invalid email
    await user.type(screen.getByLabelText(/Email Address/), 'invalid-email');
    
    // Select other required fields
    const walkInRadio = screen.getByLabelText('Walk-in');
    await user.click(walkInRadio);
    
    const insuranceSelect = screen.getByLabelText(/Insurance Provider/);
    await user.selectOptions(insuranceSelect, 'vsp');
    
    const contactConsent = screen.getByLabelText(/consent to be contacted/);
    const dataConsent = screen.getByLabelText(/consent to the processing/);
    await user.click(contactConsent);
    await user.click(dataConsent);
    
    // Submit form
    const submitButton = screen.getByText('Submit Form');
    await user.click(submitButton);
    
    // Check for email validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<IntakeForm onSubmit={mockOnSubmit} />);
    
    // Fill in other required fields
    await user.type(screen.getByLabelText(/First Name/), 'John');
    await user.type(screen.getByLabelText(/Last Name/), 'Doe');
    await user.type(screen.getByLabelText(/Email Address/), 'john@example.com');
    await user.type(screen.getByLabelText(/Date of Birth/), '1990-01-01');
    
    // Enter invalid phone number
    await user.type(screen.getByLabelText(/Phone Number/), 'abc');
    
    // Select other required fields
    const walkInRadio = screen.getByLabelText('Walk-in');
    await user.click(walkInRadio);
    
    const insuranceSelect = screen.getByLabelText(/Insurance Provider/);
    await user.selectOptions(insuranceSelect, 'vsp');
    
    const contactConsent = screen.getByLabelText(/consent to be contacted/);
    const dataConsent = screen.getByLabelText(/consent to the processing/);
    await user.click(contactConsent);
    await user.click(dataConsent);
    
    // Submit form
    const submitButton = screen.getByText('Submit Form');
    await user.click(submitButton);
    
    // Check for phone validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
    });
  });
}); 