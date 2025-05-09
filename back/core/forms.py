from django import forms

class UserForm(forms.Form):
    """Form for adding new MongoDB users"""
    name = forms.CharField(
        max_length=100, 
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    role = forms.ChoiceField(
        choices=[
            ('student', 'Student'),
            ('employee', 'Employee'),
            ('instructor', 'Instructor'),
            ('dept_head', 'Department Head'),
            ('admin_official', 'Admin Official'),
            ('super_admin', 'Super Admin'),
        ],
        widget=forms.Select(attrs={'class': 'form-control'})
    ) 